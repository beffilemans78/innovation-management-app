#!/usr/bin/env bash
set -euo pipefail

if [[ "${CODESPACES:-false}" != "true" ]]; then
  echo "This script is intended for GitHub Codespaces."
  exit 0
fi

domain="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
app_url="https://${CODESPACE_NAME}-3000.${domain}"
keycloak_url="https://${CODESPACE_NAME}-8080.${domain}"

random_secret() {
  node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64url'))"
}

auth_secret="${AUTH_SECRET:-$(random_secret)}"
client_secret="${KEYCLOAK_CLIENT_SECRET:-$(random_secret)}"
admin_password="${KEYCLOAK_ADMIN_PASSWORD:-$(random_secret)}"
bootstrap_email="${BOOTSTRAP_ADMIN_EMAIL:-admin@example.com}"

umask 077
{
  printf 'AUTH_SECRET=%s\n' "$auth_secret"
  printf 'AUTH_TRUST_HOST=true\n'
  printf 'AUTH_URL=%s\n' "$app_url"
  printf 'AUTH_KEYCLOAK_ID=innovation-app\n'
  printf 'AUTH_KEYCLOAK_SECRET=%s\n' "$client_secret"
  printf 'AUTH_KEYCLOAK_ISSUER=%s/realms/innovation\n' "$keycloak_url"
  printf 'DATABASE_URL=postgresql://innovation:innovation@localhost:5432/innovation\n'
  printf 'BOOTSTRAP_ADMIN_EMAIL=%s\n' "$bootstrap_email"
  printf 'KEYCLOAK_ADMIN_USERNAME=admin\n'
  printf 'KEYCLOAK_ADMIN_PASSWORD=%s\n' "$admin_password"
  printf 'KEYCLOAK_CLIENT_SECRET=%s\n' "$client_secret"
  printf 'APP_URL=%s\n' "$app_url"
  printf 'KEYCLOAK_URL=%s\n' "$keycloak_url"
} > .env.local

echo "Waiting for the Codespaces Docker daemon..."
until docker info >/dev/null 2>&1; do sleep 2; done

docker compose --env-file .env.local up -d

if ! pgrep -f "next dev" >/dev/null; then
  nohup npm run dev > /tmp/innovation-app.log 2>&1 &
fi

echo "Waiting for the Next.js server..."
until curl --fail --silent http://localhost:3000/login >/dev/null; do
  if ! pgrep -f "next dev" >/dev/null; then
    echo "Next.js stopped unexpectedly. Log output:"
    tail -100 /tmp/innovation-app.log || true
    exit 1
  fi
  sleep 2
done

echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U innovation >/dev/null 2>&1; do sleep 2; done

echo "Waiting for Keycloak..."
until curl --fail --silent "http://localhost:8080/realms/innovation/.well-known/openid-configuration" >/dev/null; do sleep 3; done

npx prisma db push

echo ""
echo "Innovation App: $app_url/login"
echo "Keycloak:       $keycloak_url"
echo "Mailpit:        https://${CODESPACE_NAME}-8025.${domain}"
echo "Bootstrap user: $bootstrap_email"

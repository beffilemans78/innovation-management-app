# Innovation Management App

Secure, browser-based foundation for an extensible innovation management platform.

## Stack

- Next.js and TypeScript
- Auth.js with Keycloak via OpenID Connect
- PostgreSQL and Prisma
- Role-based access control with multiple roles per user

## Local setup

1. Copy `.env.example` to `.env.local` and replace all secrets.
2. Start PostgreSQL and Keycloak with `docker compose up -d`.
3. Start the services. The `innovation` realm and OIDC client are imported automatically.
4. Run `npx prisma generate`, `npx prisma db push` and `npm run dev`.

Set `BOOTSTRAP_ADMIN_EMAIL` to the verified email address of the initial administrator. Remove it after the administrator has logged in once.

## First administrator login

1. Generate independent random values for `AUTH_SECRET`, `KEYCLOAK_ADMIN_PASSWORD` and `KEYCLOAK_CLIENT_SECRET`.
2. Use the same client-secret value for `AUTH_KEYCLOAK_SECRET` and `KEYCLOAK_CLIENT_SECRET`.
3. Set `BOOTSTRAP_ADMIN_EMAIL` to the intended administrator's email address.
4. Start the stack with `docker compose --env-file .env.local up -d`.
5. Open `http://localhost:3000/login`, register and verify the email using Mailpit at `http://localhost:8025`.
6. Configure the authenticator app when prompted. The user receives `EMPLOYEE` and `ADMINISTRATOR`.
7. Remove `BOOTSTRAP_ADMIN_EMAIL` and restart the app after the first successful login.

The local Mailpit inbox is a development tool only. Configure authenticated TLS SMTP before any external test or production deployment.

Never use the development credentials from `compose.yaml` in production.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

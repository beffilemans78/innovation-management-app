import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { provisionUser } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Keycloak],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    authorized: async ({ auth }) => Boolean(auth),
    async signIn({ account, profile }) {
      const identityProviderId = account?.providerAccountId;
      const email = profile?.email;
      if (!identityProviderId || !email || profile?.email_verified !== true) return false;
      await provisionUser({
        identityProviderId,
        email: email.toLowerCase(),
        displayName: profile.name ?? email,
      });
      return true;
    },
    async jwt({ token, account }) {
      if (account?.providerAccountId) token.userId = account.providerAccountId;
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.userId ?? token.sub ?? "");
      return session;
    },
  },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: "__Secure-innovation.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
  },
});

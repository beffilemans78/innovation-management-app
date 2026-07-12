import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Keycloak],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    authorized: async ({ auth }) => Boolean(auth),
  },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: "__Secure-innovation.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
  },
});

import type { NextAuthConfig, DefaultSession } from "next-auth";

/**
 * Edge-safe Auth.js base config. Contains NO database, bcrypt, or Upstash
 * imports so it can be bundled into the proxy (middleware) runtime. The
 * Credentials provider and its DB-backed `authorize` live in `lib/auth.ts`.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.email = user.email ?? null;
        token.name = user.name ?? null;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid) session.user = { ...session.user, id: token.uid as string };
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

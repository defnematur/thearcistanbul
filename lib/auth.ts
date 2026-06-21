import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyCredentials } from "@/lib/db/queries/users";
import { recordAttempt, recentFailureCount } from "@/lib/db/queries/loginAttempts";
import { loginEmailLimiter, loginIpLimiter } from "@/lib/rate-limit";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  ip: z.string().default("unknown"),
});

export async function authorizeCredentials(raw: unknown) {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { email, password, ip } = parsed.data;

  const [emailRl, ipRl] = await Promise.all([
    loginEmailLimiter.limit(email.toLowerCase()),
    loginIpLimiter.limit(ip),
  ]);
  if (!emailRl.success || !ipRl.success) {
    await recordAttempt(email, ip, false);
    return null;
  }

  const dbCounts = await recentFailureCount(email, ip);
  if (dbCounts.email >= 5 || dbCounts.ip >= 20) {
    await recordAttempt(email, ip, false);
    return null;
  }

  const user = await verifyCredentials(email, password);
  await recordAttempt(email, ip, !!user);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        ip: { type: "text" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid) session.user = { ...session.user, id: token.uid as string };
      return session;
    },
  },
  trustHost: true,
});

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

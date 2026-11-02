import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { DEMO_LOGIN_ACCOUNTS } from './demo-login-accounts';

// Ensure NextAuth detects host headers and protocol on Netlify, reverse proxies, and production hosts
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = 'true';
  }
  if (!process.env.NEXTAUTH_URL && process.env.URL) {
    process.env.NEXTAUTH_URL = process.env.URL;
  }
}

const DEFAULT_SECRET = '5e1a42926e6672323d3b6438eedf8c2d6cd171bb367913c3eab57b20886eddd6';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const inputEmail = credentials.email.trim();
        const inputPassword = credentials.password;

        // 1. Try database lookup first
        try {
          const user = await prisma.user.findUnique({
            where: { email: inputEmail },
          });

          if (user && user.isActive) {
            const isValid = await bcrypt.compare(inputPassword, user.password);
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              } as any;
            }
          }
        } catch (dbErr) {
          console.warn('[NextAuth] Database query failed in authorize (falling back to demo accounts):', dbErr);
        }

        // 2. Demo accounts fallback (guarantees demo logins work on live / preview even if DB is unseeded or unreachable)
        const demo = DEMO_LOGIN_ACCOUNTS.find(
          (acc) =>
            acc.email.toLowerCase() === inputEmail.toLowerCase() &&
            acc.password === inputPassword
        );

        if (demo) {
          return {
            id: `demo-${demo.role.toLowerCase()}-${demo.email.replace(/[^a-zA-Z0-9]/g, '')}`,
            email: demo.email,
            name: demo.label,
            role: demo.role,
          } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        const parsed = new URL(url);
        const base = new URL(baseUrl);
        if (parsed.host === base.host) {
          return url;
        }
      } catch {
        // Fallback for relative or malformed URLs
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || DEFAULT_SECRET,
};

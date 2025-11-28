/**
 * AUTH CONFIGURATION
 * Separated from auth.ts to avoid importing Prisma in Edge Runtime
 */

import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// UserRole type (since we changed enums to strings)
type UserRole = 'SUPERADMIN' | 'USER';

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // No database adapter - using JWT only for Edge Runtime compatibility
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },
  providers: [
    // Credentials Provider (Email + Password)
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Starting authentication...');
          
          // Import db dynamically to avoid edge runtime issues
          const { db } = await import('@/lib/db');
          const bcrypt = await import('bcryptjs');

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          console.log('📧 Looking for user:', credentials.email);

          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log('❌ User not found');
            return null;
          }

          if (!user.password) {
            console.log('❌ User has no password');
            return null;
          }

          console.log('👤 User found:', user.email, 'Role:', user.role);

          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Authentication successful!');

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as UserRole,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      },
    }),

    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Update token on session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },

    async signIn({ user, account }) {
      // Allow superadmin to sign in
      if (user.email === process.env.SUPERADMIN_EMAIL) {
        return true;
      }

      // For OAuth, check if user exists or create new user
      if (account?.provider !== 'credentials') {
        const { db } = await import('@/lib/db');
        
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Create new user
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              role: 'USER',
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Log user creation
      const { db } = await import('@/lib/db');
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_CREATED',
          resource: 'user',
          resourceId: user.id,
          metadata: JSON.stringify({ email: user.email }),
        },
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

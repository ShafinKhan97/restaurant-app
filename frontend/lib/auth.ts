// frontend/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  restaurantId?: string;
  accessToken: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      restaurantId?: string;
    };
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    role: string;
    restaurantId?: string;
    accessToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // NEVER return undefined
        }

        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";

          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (data?.success && data?.user && data?.token) {
            const user: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.firstName ? `${data.user.firstName} ${data.user.lastName}` : data.user.name,
              role: data.user.role,
              restaurantId: data.user.restaurantId,
              accessToken: data.token,
            };

            return user;
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;

        token.id = u.id;
        token.name = u.name;
        token.role = u.role;
        token.restaurantId = u.restaurantId;
        token.accessToken = u.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.restaurantId = token.restaurantId;
      }

      session.accessToken = token.accessToken;

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
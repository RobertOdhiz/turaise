import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail } from "./db/queries"
import { getAuthUserByEmail, verifyPassword } from "./auth-helpers"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Get auth user with password hash
        const authUser = await getAuthUserByEmail(credentials.email)
        if (!authUser) {
          return null
        }

        // Verify password
        const isValid = await verifyPassword(credentials.password, authUser.password_hash)
        if (!isValid) {
          return null
        }

        // Get user profile
        const user = await getUserByEmail(credentials.email)
        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}


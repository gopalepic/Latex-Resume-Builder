import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import {PrismaAdapter} from "@next-auth/prisma-adapter";

import {prisma} from "@/lib/prisma"; // Adjust the import path as necessary

console.log("Prisma loaded" , typeof prisma?.$connect === "function" );


export const authOptions: NextAuthOptions = {

  adapter: PrismaAdapter(prisma),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization:{
        params: {
          scope: "read:user user:email",
        },
      }
    }),
  ],

  callbacks: {

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, account , user }) {
      // Add provider info to the token during login
      if(user){
        token.id = user.id;
      }
      if(account?.provider){
        token.provider = account.provider;
      }
       
      return token;
    },

    async signIn({ user, account, profile,email, credentials }) {
        console.log("✅ GitHub signIn callback:");
    console.log("User:", user);
    console.log("Account:", account);
    console.log("Profile:", profile);
    console.log("Email:", email);

    return true;
    },
     async session({ session,user , token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  }


export default NextAuth(authOptions);

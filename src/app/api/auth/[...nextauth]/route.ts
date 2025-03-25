import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { compare } from "bcrypt";
import formSchema from "@/lib/schemas/signin";

//ADDING CUSTOM FIELDS TO DEFAULT TYPES PROVIDED BY NEXT-AUTH
declare module "next-auth"{
  interface User{
    id:string;
    role:string;
  }

  interface Session{
    user:User;
  }
}

declare module "next-auth/jwt" {
  interface JWT{
    id:string;
    role:string;
  }
}




export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = formSchema.parse({ email: credentials?.email, password: credentials?.password });
          await dbConnect();
          const user = await User.findOne({ email }).lean();
          if (user && password) {
            if (await compare(password, user.password)) {

              console.log({ ...user, id: user._id.toString() });
              // return { ...user, id: user._id.toString() };
              return {
                id: user._id.toString(),
                email:user.email,
                role : user.role,
                name: user.name
              };

              

            }
          }
          return null;
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    // error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role=user.role;
        console.log("TOKEN:", token);
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {

      session.user.id = token.id;
      session.user.role = token.role;

      
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

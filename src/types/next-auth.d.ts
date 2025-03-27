import { Users } from "@/models/User";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: Users & DefaultSession["user"];
  }
}

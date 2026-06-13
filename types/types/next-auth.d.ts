// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  // ขยาย Type ของ Session User
  interface Session {
    user: {
      id: string
      role: string
      routerId: number
    } & DefaultSession["user"]
  }

  // ขยาย Type ของ User Object ที่คืนค่ามาจาก authorize()
  interface User {
    id: string
    role: string
    routerId: number
  }
}

declare module "next-auth/jwt" {
  // ขยาย Type ของ JWT Token
  interface JWT {
    id: string
    role: string
    routerId: number
  }
}
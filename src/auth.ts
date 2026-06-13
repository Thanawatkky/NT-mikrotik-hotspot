// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs" // เปลี่ยนเป็น bcryptjs แล้ว
import { prisma } from "./lib/db"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // ดึงค่าคอนฟิกพื้นฐานมาใช้
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.")
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        
        // ปรับชื่อฟิลด์ให้ตรงกับตารางที่คุณแก้ในบทเรียนก่อนหน้า (passwordHash)
        if (!user || !user.password) {
          throw new Error("Invalid credentials.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials.")
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        } as any
      },
    }),
  ],
})
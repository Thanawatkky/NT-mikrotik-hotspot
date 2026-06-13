// middleware.ts
import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

// 1. กำหนดสิทธิ์ในการเข้าถึงแต่ละเส้นทาง (Access Control List)
const ROLE_ROUTES = {
  // หน้าสำหรับ ADMIN เท่านั้น (เช่น จัดการพนักงาน, ลบเราเตอร์)
  ADMIN: ["/dashboard/admin", "/dashboard/users-management"],
  
  // หน้าสำหรับ MANAGER ขึ้นไป (STAFF ห้ามเข้า เช่น สรุปยอดรายได้, ปรับแพ็กเกจราคา)
  MANAGER: ["/dashboard/reports", "/dashboard/packages"],
  
  // หน้าพื้นฐานที่ STAFF, MANAGER, ADMIN เข้าได้ทั้งหมด (เช่น เจนตั๋ว Hotspot, ดูสถานะเราเตอร์)
  STAFF: ["/dashboard", "/dashboard/vouchers", "/dashboard/router-status"]
}

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role as string | undefined // ดึง Role จาก Token
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // -------------------------------------------------------------
  // กฎข้อที่ 1: จัดการคนยังไม่ได้ล็อกอิน (Authentication Check)
  // -------------------------------------------------------------
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isLoginRoute = pathname === "/login"

  if (isDashboardRoute && !isLoggedIn) {
    let callbackUrl = pathname
    if (nextUrl.search) callbackUrl += nextUrl.search
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    )
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // -------------------------------------------------------------
  // กฎข้อที่ 2: ตรวจสอบระดับสิทธิ์ (Authorization Check)
  // -------------------------------------------------------------
  if (isLoggedIn && userRole) {
    
    // ตรวจสอบหน้าของ ADMIN: ถ้าไม่ใช่ ADMIN แต่พยายามเข้ามา -> ดีดไปหน้าปฏิเสธสิทธิ์
    const isAdminRoute = ROLE_ROUTES.ADMIN.some(route => pathname.startsWith(route))
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/error/unauthorized", nextUrl))
    }

    // ตรวจสอบหน้าของ MANAGER: STAFF ห้ามเข้า (เข้าได้แค่ ADMIN และ MANAGER)
    const isManagerRoute = ROLE_ROUTES.MANAGER.some(route => pathname.startsWith(route))
    if (isManagerRoute && userRole === "STAFF") {
      return NextResponse.redirect(new URL("/dashboard/error/unauthorized", nextUrl))
    }
    
    // หมายเหตุ: สำหรับเส้นทาง STAFF ทุกคน (รวมถึง ADMIN/MANAGER) เข้าถึงได้อยู่แล้วตามธรรมชาติ
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
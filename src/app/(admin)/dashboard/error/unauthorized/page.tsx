// app/dashboard/error/unauthorized/page.tsx
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-2">🚫 ปฏิเสธการเข้าถึง</h1>
      <p className="text-gray-600 mb-6">บัญชีของคุณไม่มีสิทธิ์เพียงพอในการเข้าใช้งานหน้านี้</p>
      <Link 
        href="/dashboard" 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  )
}
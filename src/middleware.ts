// /middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
const isProtectedRoute = createRouteMatcher([
  '/',           // หน้า Home
  '/router(.*)', // ทุก path ที่ขึ้นต้นด้วย /router เช่น /router, /router/new
  '/users(.*)',  // ทุก path ที่ขึ้นต้นด้วย /users เช่น /users, /users/123
]);
export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) await auth.protect()
  // --- 1. จัดการ Preflight Request (OPTIONS) ก่อนเสมอ ---
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    const response = new Response(null, { status: 204 }); // 204 No Content
    
    // ใส่ Headers ที่จำเป็นสำหรับการอนุญาต CORS
    response.headers.set('Access-Control-Allow-Origin', '*'); // ใน Production ควรระบุ Domain จริง
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // --- 2. สำหรับ Request จริง (GET, POST, etc.) ---
  // Clerk จะจัดการ auth ตรงนี้โดยอัตโนมัติ

  // สร้าง Response เพื่อไปต่อ
  const response = NextResponse.next();

  // เพิ่ม Header อนุญาต Origin ให้กับ Response ของ Request จริงด้วย
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
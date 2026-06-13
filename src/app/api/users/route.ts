import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body: Prisma.UserCreateInput = await request.json();
        console.log("Received user data:", body); // Debug log เพื่อดูข้อมูลที่ได้รับ

    // --- 1. ตรวจสอบข้อมูลเบื้องต้น ---
    if (!body.name || !body.email || !body.password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }


    // --- 2. ตรวจสอบข้อมูลกับฐานข้อมูล (สมมติว่าใช้ Prisma) ---
    const user = await prisma.user.findUnique({
        where: { email: String(body.email) },
    });

    if(!user) {
        await prisma.user.create({
            data: {
                name: body.name,
                description: body.description,
                email: body.email,
                password: bcrypt.hashSync(body.password, 10), // ควรทำการ Hash รหัสผ่านก่อนเก็บในฐานข้อมูล
                role: body.role || "STAFF", // กำหนด role เป็น STAFF ตามที่ระบุใน schema
            },
        });
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    }
    return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });

}

export async function GET() {
    const users = await prisma.user.findMany({
        where: {
            role: {
                not: "ADMIN", // ดึงเฉพาะผู้ใช้ที่มี role ไม่ใช่ ADMIN
            } , // ดึงเฉพาะผู้ใช้ที่มี role เป็น STAFF
        }
    });
    return NextResponse.json(users);
}
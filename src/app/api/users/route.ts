import { prisma } from "@/lib/db";
import { MikrotikConnection } from "@/lib/mt";
import { validateThaiID } from "@/lib/thaiIdVaildate";
import { getAllUsers } from "@/services/users-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { idCard, phone, ip } = await request.json();

    // --- 1. ตรวจสอบข้อมูลเบื้องต้น ---
    if (!validateThaiID(idCard)) {
        return NextResponse.json({ message: "เลขบัตรประจำตัวประชาชนไม่ถูกต้อง" }, { status: 400 });
    }

    const router = await prisma.router.findFirst({
        where: { ip: ip }
    });

    if (!router) {
        return NextResponse.json({ message: "Router not found!" }, { status: 404 });
    }

    // --- 2. จัดการการเชื่อมต่อและ Logic ของ MikroTik ---
    let mt;
    try {
        mt = await MikrotikConnection(router.ip, router.username, router.password, router.port_api);
        await mt.connect();

        const username = `T-${phone}`;
        const comment = `${idCard}, ${phone}`;

        const users = await mt.write('/ip/hotspot/user/print', [`?name=${username}`]);

        // ถ้ายังไม่มี user บน MikroTik ให้สร้างใหม่
        if (users.length === 0) {
            await mt.write('/ip/hotspot/user/add', [
                `=name=${username}`,
                `=password=`,
                `=profile=default`,
                `=comment=${comment}`,
                `=server=hotspot`
            ]);
        }

        // --- 3. บันทึกข้อมูลลงฐานข้อมูลด้วย Transaction และ Error Handling ---
        await prisma.$transaction(async (tx) => {
            try {
                await tx.user.upsert({
                    where: {
                        name_routerId: {
                            name: username,
                            routerId: router.id
                        }
                    },
                    update: {
                        description: comment, // อัปเดต description ถ้าเจอ user อยู่แล้ว
                    },
                    create: {
                        name: username,
                        description: comment,
                        routerId: router.id
                    }
                });
            } catch (dbError) {
                // Handle specific Prisma errors
                if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === 'P2002') {
                    console.log("User already exists, continuing...");
                    // ถ้าเจอ unique constraint error แสดงว่า user มีอยู่แล้ว
                    // ให้ดำเนินการต่อได้เลย (ไม่ต้อง throw error)
                } else {
                    throw dbError; // Re-throw other database errors
                }
            }
        }, {
            timeout: 10000, // 10 seconds timeout
            maxWait: 5000   // Maximum wait time for transaction to start
        });

        return NextResponse.json({ success: true, username: username }, { status: 200 });

    } catch (error) {
        console.error("API Error:", error);
        
        // ให้ข้อมูล error ที่ชัดเจนขึ้นสำหรับ debugging
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ 
                message: "ผู้ใช้นี้มีอยู่ในระบบแล้ว", 
                username: `T-${phone}` 
            }, { status: 200 }); // Return success เพราะผู้ใช้มีอยู่แล้ว
        }
        
        return NextResponse.json({ 
            message: "ไม่สามารถเชื่อมต่อกับ MikroTik หรือบันทึกข้อมูลได้" 
        }, { status: 500 });
    } finally {
        if (mt && mt.connected) {
            console.log("Closing MikroTik connection.");
            await mt.close();
        }
    }
}

export async function GET() {
    const users = await getAllUsers();
    return NextResponse.json(users, { status: 200 });
}
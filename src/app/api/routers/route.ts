import '@/lib/routerMonitor';
import { createRouter, getAllRouters } from "@/services/routers-service";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await getAllRouters();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        
    }
} 

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as Prisma.RouterCreateInput;
        if (!body) {
            return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }
        // Assuming createRouter is a function that handles the creation of a router
        
        

             
            const createData = await createRouter({
                sitename: body.sitename,
                ip: body.ip,
                username: body.username,
                password: body.password,
                port_api: body.port_api,
                port_hst: body.port_hst,
            });
            if (!createData) {
                return NextResponse.json({ error: "เกิดข้อผิดพลาดในการทำงาน" }, { status: 500 });
            }
            return NextResponse.json({ message: "เพิ่มข้อมูลเราท์เตอร์สำเร็จ" }, { status: 200 });
       
    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json({ error: "เซิร์ฟเวอร์ไม่ตอบสนอง" }, { status: 500 });
    }
    
}
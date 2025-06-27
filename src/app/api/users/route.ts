
import { prisma } from "@/lib/db";
import { MikrotikConnection } from "@/lib/mt";
import { createUser, getAllUsers } from "@/services/users-service";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    const { idCard, phone, ip} = await request.json();

    const router = await prisma.router.findFirst({
        where: {
           ip: ip
        }
    });

    if(!router) {
        return NextResponse.json({ message: "Router not found!"}, { status: 400});
    }

   try {
        const mt = await MikrotikConnection(router.ip, router.username, router.password, router.port_api);
        const username = `T-${phone}`;
        const comment = `${idCard}, ${phone}`;
        mt.connect();
        const users = await mt.write('/ip/hotspot/user/print', [
            `?name=${username}`
          ]);
      
          if (users.length === 0) {
            await mt.write('/ip/hotspot/user/add', [
              `=name=${username}`,
              `=password=`,
              `=profile=default`,
              `=comment=${comment}`,
              `=server=hotspot`
            ]);
            const body = {
              name: username,
              description: comment,
              router: {
                connect: {
                  id: router.id
                }
              }
            }
            const userscreate = await createUser(body);
            if(!userscreate){
              return NextResponse.json({ message: "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้" }, { status: 500 });
            }
          }
          await mt.close(); // ✅ ปิด connection ที่นี่
          
          
         
          return NextResponse.json({ success: true, username }, { status: 200 });
   } catch (error) {
    console.log(error);
    
        return NextResponse.json({ message: "ไม่สามารถเชื่อมต่อกับเราท์เตอร์ได้" }, { status: 500 });
    }    
}

export async function GET() {
  const users = await getAllUsers()
    return NextResponse.json(users, { status: 200})
}
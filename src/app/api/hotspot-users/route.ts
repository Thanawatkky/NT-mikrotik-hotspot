import { prisma } from "@/lib/db";
import { MikrotikConnection } from "@/lib/mt";
import { validateThaiID } from "@/lib/thaiIdVaildate";
import { HotspotStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { idCard, phone, ip } = await request.json();

  if (!validateThaiID(idCard)) {
    return NextResponse.json({ message: "Invalid Thai ID card number." }, { status: 400 });
  }

  const router = await prisma.router.findFirst({
    where: { ip },
  });

  if (!router) {
    return NextResponse.json({ message: "Router not found." }, { status: 404 });
  }

  let mt: Awaited<ReturnType<typeof MikrotikConnection>> | null = null;

  try {
    mt = await MikrotikConnection(router.ip, router.username, router.password, router.portApi);

    const username = `T-${phone}`;
    const comment = `${idCard}, ${phone}`;
    const users = await mt.write("/ip/hotspot/user/print", [`?name=${username}`]);

    if (users.length === 0) {
      await mt.write("/ip/hotspot/user/add", [
        `=name=${username}`,
        "=password=",
        "=profile=default",
        `=comment=${comment}`,
        "=server=hotspot",
      ]);
    }

    await prisma.hotspotUser.upsert({
      where: {
        username_per_router: {
          username,
          routerId: router.id,
        },
      },
      update: {
        password: "",
        profile: "default",
        status: HotspotStatus.PENDING,
      },
      create: {
        tenantId: router.tenantId,
        routerId: router.id,
        username,
        password: "",
        profile: "default",
        status: HotspotStatus.PENDING,
      },
    });

    return NextResponse.json({ success: true, username }, { status: 200 });
  } catch (error) {
    console.error("Hotspot user API error:", error);
    return NextResponse.json(
      { message: "Unable to connect to MikroTik or save hotspot user." },
      { status: 500 }
    );
  } finally {
    if (mt?.connected) {
      await mt.close();
    }
  }
}

export async function GET() {
  const users = await prisma.hotspotUser.findMany({
    orderBy: { createdAt: "desc" },
    include: { router: true, tenant: true },
  });

  return NextResponse.json(users, { status: 200 });
}

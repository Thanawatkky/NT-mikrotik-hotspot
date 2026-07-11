import "@/lib/routerMonitor";
import { createRouter, getAllRouters } from "@/services/routers-service";
import { RouterStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type RouterPayload = {
  tenantId?: string;
  sitename?: string;
  location?: string;
  username?: string;
  password?: string;
  ip?: string;
  portApi?: string | number;
  portHotspot?: string | number;
  port_api?: string | number;
  port_hst?: string | number;
};

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
    const body = (await request.json()) as RouterPayload;
    const portApi = Number(body.portApi ?? body.port_api ?? 8728);
    const portHotspot = Number(body.portHotspot ?? body.port_hst ?? 80);

    if (!body.tenantId || !body.sitename || !body.ip || !body.username || !body.password) {
      return NextResponse.json({ error: "Missing required router fields." }, { status: 400 });
    }

    if (!Number.isInteger(portApi) || !Number.isInteger(portHotspot)) {
      return NextResponse.json({ error: "Router ports must be valid numbers." }, { status: 400 });
    }

    await createRouter({
      tenant: { connect: { id: body.tenantId } },
      sitename: body.sitename,
      location: body.location ?? null,
      ip: body.ip,
      username: body.username,
      password: body.password,
      portApi,
      portHotspot,
      status: RouterStatus.OFFLINE,
    });

    return NextResponse.json({ message: "Router created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

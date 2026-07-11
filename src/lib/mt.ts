import { getAllRouters, updateRouter } from "@/services/routers-service";
import { RouterStatus } from "@prisma/client";
import { RouterOSAPI } from "node-routeros";
import { Server } from "socket.io";

declare global {
  var io: Server | undefined;
}

type RouterPort = string | number;

export async function MikrotikConnection(
  host: string,
  user: string,
  password: string,
  port: RouterPort
) {
  const conn = new RouterOSAPI({
    host,
    user,
    password,
    port: Number(port),
    timeout: 20000,
  });

  try {
    await conn.connect();
    return conn;
  } catch (error) {
    console.error("Connection failed:", error);
    throw new Error("Failed to communicate with MikroTik router.");
  }
}

async function checkRouter(host: string, user: string, password: string, port: RouterPort) {
  const conn = new RouterOSAPI({
    host,
    user,
    password,
    port: Number(port),
    timeout: 20000,
  });

  try {
    await conn.connect();
    await conn.close();
    return RouterStatus.ONLINE;
  } catch {
    return RouterStatus.OFFLINE;
  }
}

export async function checkAllRouters() {
  const routers = await getAllRouters();

  for (const router of routers) {
    const status = await checkRouter(
      router.ip,
      router.username,
      router.password,
      router.portApi
    );

    await updateRouter(router.id, { status });

    if (global.io) {
      global.io.emit("router-status", {
        id: router.id,
        status,
      });
    }
  }
}

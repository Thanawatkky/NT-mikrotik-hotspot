// ✅ lib/mikrotik.js
import { getAllRouters, updateRouter } from '@/services/routers-service';
import { RouterOSAPI } from 'node-routeros';
import { Server } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}


export async function MikrotikConnection(host: string, user: string, password: string, port: string) {
  const conn = new RouterOSAPI({
    host: host,
    user: user,
    password: password,
    port: Number(port),
    timeout: 20000,
  });

  try {
    await conn.connect();
    return conn;
  } catch (error) {
    console.error(`Connection failed:`, error);
    throw new Error('Failed to communicate with MikroTik router.');
  }
}

async function checkRouter(host: string, user: string, password: string, port: string) {
  const conn =  new RouterOSAPI({
    host: host,
    user: user,
    password: password,
    port: Number(port),
    timeout: 20000
  });

  try {
    await conn.connect();
    await conn.close();
    return 1;
  } catch {
    return 0;
  }
}

export async function checkAllRouters() {
  const routers = await getAllRouters();

  for (const router of routers) {
    
      const status = await checkRouter(router.ip, router.username, router.password, router.port_api);
      await updateRouter(String(router.id), {
        status: status
      });
      if(global.io) {
        global.io.emit('router-status', {
          id: router.id,
          status: status
        });
      }

  }
  
}
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getAllRouters() {
  return prisma.router.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOneRouter(id: string) {
  return prisma.router.findUnique({
    where: { id },
  });
}

export async function createRouter(data: Prisma.RouterCreateInput) {
  return prisma.router.create({ data });
}

export async function updateRouter(id: string, data: Prisma.RouterUpdateInput) {
  return prisma.router.update({
    where: { id },
    data,
  });
}

export async function deleteRouter(id: string) {
  return prisma.router.delete({
    where: { id },
  });
}

export async function getRouterCount() {
  return prisma.router.count();
}

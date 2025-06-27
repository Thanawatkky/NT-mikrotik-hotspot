import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
export async function getAllRouters() {
    return await prisma.router.findMany({
        orderBy: {
            id: 'desc',
        },
    });
}

export async function getOneRouter(id: string) {
    return await prisma.router.findUnique({
        where: {
            id: parseInt(id),
        },
    });
}

export async function createRouter(data: Prisma.RouterCreateInput) {
    return await prisma.router.create({
        data
    });
}

export async function updateRouter(id: string, data: Prisma.RouterUpdateInput) {
    return await prisma.router.update({
        where: {
            id: parseInt(id),
        },
        data,
    });
}

export async function deleteRouter(id: string) {
    return await prisma.router.delete({
        where: {
            id: parseInt(id),
        },
    });
}

export async function getRouterCount() {
    const count = await prisma.router.count();
    return count;
}


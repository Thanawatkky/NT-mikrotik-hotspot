import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getAllUsers() {
    return await prisma.user.findMany({
        orderBy: {
            id: 'desc',
        },
        include: {
            router: true,
        },
    });
}

export async function getOneUser(id: string) {
    return await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
    });
}

export async function createUser(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
        data,
    });
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
        where: {
            id: parseInt(id),
        },
        data,
    });
}

export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: {
            id: parseInt(id),
        },
    });
}

export async function getUserCount() {
    const count = await prisma.user.count();
    return count;
}
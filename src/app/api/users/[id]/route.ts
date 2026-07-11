import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma, SystemRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES: SystemRole[] = [SystemRole.SUPER_ADMIN, SystemRole.TENANT_ADMIN];
const TENANT_ROLES: SystemRole[] = [
  SystemRole.TENANT_ADMIN,
  SystemRole.TENANT_MANAGER,
  SystemRole.TENANT_STAFF,
];

type Params = Promise<{ id: string }>;
type UserPayload = {
  email?: string;
  password?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: SystemRole;
  status?: UserStatus;
  tenantId?: string | null;
};

function sanitizeUser(user: Prisma.UserGetPayload<{ include: { tenant: true } }>) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    tenantId: user.tenantId,
    tenant: user.tenant
      ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        }
      : null,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function isSystemRole(value: unknown): value is SystemRole {
  return typeof value === "string" && Object.values(SystemRole).includes(value as SystemRole);
}

function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && Object.values(UserStatus).includes(value as UserStatus);
}

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !isSystemRole(role) || !ADMIN_ROLES.includes(role)) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return {
    session: {
      user: {
        id: session.user.id,
        role,
        tenantId: session.user.tenantId ?? null,
      },
    },
  };
}

function validateTenantScope(payload: UserPayload) {
  if (payload.role && TENANT_ROLES.includes(payload.role) && !payload.tenantId) {
    return "Tenant is required for tenant roles.";
  }

  if (payload.role === SystemRole.SUPER_ADMIN && payload.tenantId) {
    return "SUPER_ADMIN must not be assigned to a tenant.";
  }

  return null;
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  const body = (await request.json()) as UserPayload;
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (
    admin.session.user.role === SystemRole.TENANT_ADMIN &&
    existingUser.tenantId !== admin.session.user.tenantId
  ) {
    return NextResponse.json({ error: "Tenant admin can only manage users in their tenant." }, { status: 403 });
  }

  const role = isSystemRole(body.role) ? body.role : existingUser.role;
  const status = isUserStatus(body.status) ? body.status : existingUser.status;
  const tenantId = role === SystemRole.SUPER_ADMIN ? null : body.tenantId ?? existingUser.tenantId;
  const scopeError = validateTenantScope({ role, tenantId });

  if (scopeError) return NextResponse.json({ error: scopeError }, { status: 400 });

  if (admin.session.user.role === SystemRole.TENANT_ADMIN) {
    if (role === SystemRole.SUPER_ADMIN || tenantId !== admin.session.user.tenantId) {
      return NextResponse.json({ error: "Tenant admin can only manage users in their tenant." }, { status: 403 });
    }
  }

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
  }

  const data: Prisma.UserUpdateInput = {
    displayName: body.displayName?.trim() || existingUser.displayName,
    firstName: body.firstName?.trim() || null,
    lastName: body.lastName?.trim() || null,
    role,
    status,
    tenant: tenantId ? { connect: { id: tenantId } } : { disconnect: true },
  };

  if (body.email) data.email = body.email.trim().toLowerCase();

  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    data.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { tenant: true },
  });

  return NextResponse.json({ user: sanitizeUser(user) });
}

export async function DELETE(_request: NextRequest, context: { params: Params }) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  if (id === admin.session.user.id) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (
    admin.session.user.role === SystemRole.TENANT_ADMIN &&
    existingUser.tenantId !== admin.session.user.tenantId
  ) {
    return NextResponse.json({ error: "Tenant admin can only manage users in their tenant." }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status: UserStatus.INACTIVE },
    include: { tenant: true },
  });

  return NextResponse.json({ user: sanitizeUser(user), message: "User deactivated." });
}

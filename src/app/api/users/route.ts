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

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { role, tenantId } = admin.session.user;
  const where: Prisma.UserWhereInput =
    role === SystemRole.SUPER_ADMIN ? {} : { tenantId: tenantId ?? undefined };

  const [users, tenants] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { tenant: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findMany({
      where: role === SystemRole.SUPER_ADMIN ? {} : { id: tenantId ?? undefined },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return NextResponse.json({
    users: users.map(sanitizeUser),
    tenants,
    currentUser: admin.session.user,
  });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const body = (await request.json()) as UserPayload;
  const email = body.email?.trim().toLowerCase();
  const displayName = body.displayName?.trim();
  const password = body.password ?? "";
  const role = isSystemRole(body.role) ? body.role : SystemRole.TENANT_STAFF;
  const status = isUserStatus(body.status) ? body.status : UserStatus.ACTIVE;
  const tenantId = role === SystemRole.SUPER_ADMIN ? null : body.tenantId ?? null;

  if (!email || !displayName || !password) {
    return NextResponse.json(
      { error: "Email, display name, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const scopeError = validateTenantScope({ role, tenantId });
  if (scopeError) return NextResponse.json({ error: scopeError }, { status: 400 });

  if (admin.session.user.role === SystemRole.TENANT_ADMIN) {
    if (role === SystemRole.SUPER_ADMIN || tenantId !== admin.session.user.tenantId) {
      return NextResponse.json({ error: "Tenant admin can only manage users in their tenant." }, { status: 403 });
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
  }

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      firstName: body.firstName?.trim() || null,
      lastName: body.lastName?.trim() || null,
      password: await bcrypt.hash(password, 10),
      role,
      status,
      tenantId,
      createdById: admin.session.user.id,
    },
    include: { tenant: true },
  });

  return NextResponse.json({ user: sanitizeUser(user) }, { status: 201 });
}

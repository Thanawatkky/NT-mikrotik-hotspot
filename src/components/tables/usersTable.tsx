"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  PencilIcon,
  PlusCircleIcon,
  RefreshCcwIcon,
  UserXIcon,
} from "lucide-react";
import useSWR from "swr";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { showToast } from "../sweetalert/toaset";

type SystemRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "TENANT_MANAGER" | "TENANT_STAFF";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  role: SystemRole;
  status: UserStatus;
  tenantId: string | null;
  tenant: Tenant | null;
  lastLoginAt: string | null;
  createdAt: string;
};

type UsersResponse = {
  users: AdminUser[];
  tenants: Tenant[];
  currentUser: {
    id: string;
    role: SystemRole;
    tenantId: string | null;
  };
};

type UserFormState = {
  id?: string;
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: SystemRole;
  status: UserStatus;
  tenantId: string;
};

const TENANT_ID_NONE = "__none";
const roles: SystemRole[] = ["SUPER_ADMIN", "TENANT_ADMIN", "TENANT_MANAGER", "TENANT_STAFF"];
const statuses: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const defaultForm: UserFormState = {
  email: "",
  password: "",
  displayName: "",
  firstName: "",
  lastName: "",
  role: "TENANT_STAFF",
  status: "ACTIVE",
  tenantId: TENANT_ID_NONE,
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load users.");
  }

  return data as UsersResponse;
};

function formatRole(role: SystemRole) {
  return role.replaceAll("_", " ");
}

function statusColor(status: UserStatus) {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "warning";
  return "light";
}

function roleColor(role: SystemRole) {
  if (role === "SUPER_ADMIN") return "primary";
  if (role === "TENANT_ADMIN") return "info";
  if (role === "TENANT_MANAGER") return "warning";
  return "light";
}

export function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<UserFormState>(defaultForm);
  const { data, error, isLoading, mutate } = useSWR("/api/users", fetcher);

  const users = React.useMemo(() => data?.users ?? [], [data?.users]);
  const tenants = React.useMemo(() => data?.tenants ?? [], [data?.tenants]);
  const currentUser = data?.currentUser;
  const isEditing = Boolean(form.id);
  const isSuperAdminForm = form.role === "SUPER_ADMIN";

  const resetForm = React.useCallback(() => {
    setForm({
      ...defaultForm,
      tenantId: tenants[0]?.id ?? TENANT_ID_NONE,
    });
  }, [tenants]);

  React.useEffect(() => {
    if (!isDialogOpen) resetForm();
  }, [isDialogOpen, resetForm]);

  const openEditDialog = React.useCallback((user: AdminUser) => {
    setForm({
      id: user.id,
      email: user.email,
      password: "",
      displayName: user.displayName,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      role: user.role,
      status: user.status,
      tenantId: user.tenantId ?? TENANT_ID_NONE,
    });
    setIsDialogOpen(true);
  }, []);

  const deactivateUser = React.useCallback(async (user: AdminUser) => {
    const result = await Swal.fire({
      title: "Deactivate user?",
      text: `${user.displayName} will not be able to sign in.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const responseData = await response.json();

    if (!response.ok) {
      showToast(responseData?.error || "Unable to deactivate user.", "error");
      return;
    }

    showToast("User deactivated.", "success");
    mutate();
  }, [mutate]);

  const columns = React.useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "displayName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-800 dark:text-white/90">
              {row.original.displayName}
            </div>
            <div className="text-xs text-gray-500">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge color={roleColor(row.original.role)} size="sm">
            {formatRole(row.original.role)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge color={statusColor(row.original.status)} size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "tenant",
        header: "Tenant",
        cell: ({ row }) => row.original.tenant?.name ?? "All tenants",
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last login",
        cell: ({ row }) =>
          row.original.lastLoginAt
            ? new Date(row.original.lastLoginAt).toLocaleString()
            : "Never",
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                  <PencilIcon />
                  Edit user
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  disabled={isCurrentUser || user.status === "INACTIVE"}
                  onClick={() => deactivateUser(user)}
                >
                  <UserXIcon />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [currentUser?.id, deactivateUser, openEditDialog]
  );

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.displayName) {
      showToast("Email and display name are required.", "error");
      return;
    }

    if (!isEditing && form.password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    if (!isSuperAdminForm && form.tenantId === TENANT_ID_NONE) {
      showToast("Tenant is required for tenant roles.", "error");
      return;
    }

    const payload = {
      email: form.email,
      password: form.password || undefined,
      displayName: form.displayName,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      role: form.role,
      status: form.status,
      tenantId: isSuperAdminForm ? null : form.tenantId,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(isEditing ? `/api/users/${form.id}` : "/api/users", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();

      if (!response.ok) {
        showToast(responseData?.error || "Unable to save user.", "error");
        return;
      }

      showToast(isEditing ? "User updated." : "User created.", "success");
      setIsDialogOpen(false);
      mutate();
    } catch {
      showToast("Network error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="w-full p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="w-full p-4 text-red-500">Error loading users: {error.message}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("displayName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCcwIcon />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetForm}>
                <PlusCircleIcon />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
              <form onSubmit={submitForm}>
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
                  <DialogDescription>
                    Manage dashboard access, role, status, and tenant assignment.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={form.displayName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, displayName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, firstName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, lastName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      Password {isEditing ? "(leave blank to keep current)" : ""}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          role: value as SystemRole,
                          tenantId:
                            value === "SUPER_ADMIN"
                              ? TENANT_ID_NONE
                              : current.tenantId === TENANT_ID_NONE
                              ? tenants[0]?.id ?? TENANT_ID_NONE
                              : current.tenantId,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {formatRole(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, status: value as UserStatus }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tenant</Label>
                    <Select
                      disabled={isSuperAdminForm}
                      value={isSuperAdminForm ? TENANT_ID_NONE : form.tenantId}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, tenantId: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TENANT_ID_NONE}>All tenants</SelectItem>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

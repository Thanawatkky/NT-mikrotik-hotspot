"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown, PlusCircleIcon, RefreshCcwIcon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useSWR from "swr"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"

// Updated Router type to match your database model
export type Users = {
  id: number // Primary key (r_id in database)
  name: string
  description?: string
  router: {
    id: number
    sitename: string
  }
}

// User type for the relation (if needed)
export type User = {
  id: number
  // Add other user fields as needed
}
 

const fetcher = (url: string) => fetch(url).then(res => res.json());

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
}
export function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [addUserData, setAddUserData] = React.useState<Users | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [UserData, setUserData] = React.useState<Users[]>([])
  const { data, error, isLoading, mutate } = useSWR("/api/users", fetcher)

  
  const columns: ColumnDef<Users>[] = [
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
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="font-mono">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("description")}</div>
      ),
    },
  
    
  
   
  ]
  // Update router data when SWR data changes
  React.useEffect(() => {
    if (data) {
      setUserData(data)
    }
  }, [data])

  // Cleanup socket on component unmount


  const table = useReactTable({
    data: UserData,
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
  })
  
  // Show loading state
  if (isLoading) {
    return <div className="w-full p-4">Loading users...</div>
  }

  // Show error state
  if (error) {
    return <div className="w-full p-4 text-red-500">Error loading users: {error.message}</div>
  }

  return (
    <div className="w-full">
      
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter by User name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />


        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => mutate()}
            > <RefreshCcwIcon/> Refresh </Button>         
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(true)}
                    > <PlusCircleIcon /> Add </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Enter user details to add to the system
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 grid-cols-2 py-4">
                          
                          <div className="grid gap-2">
                            <Label htmlFor="fullname">ชื่อ-นามสกุล</Label>
                            <Input 
                              id="fullname" 
                              name="fullname" 
                              type="fullname"
                              onChange={(e) => setAddUserData({...addUserData, name: String(e.target.value) } as Users)} 
                              value={addUserData?.name || ""} 
                              className="font-mono"
                              aria-required="true"
                            />
                          </div>
                        </div>
                        <DialogFooter>  
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit">Add Router</Button>
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No routers found.
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

    
  )
}
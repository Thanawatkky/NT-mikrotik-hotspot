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
import { ArrowUpDown, RefreshCcwIcon } from "lucide-react"
// import { io, Socket } from "socket.io-client"
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

// Updated Router type to match your database model
export type Router = {
  id: number // Primary key (r_id in database)
  sitename: string
  username?: string
  ip: string
  port_api: string
  port_hst: string
  status: number // Optional since it's not in the database
   // Function to delete the router
}

// User type for the relation (if needed)
export type User = {
  id: number
  // Add other user fields as needed
}

 

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function RouterDetailTableDashboard() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const { data = [], error, isLoading, mutate } = useSWR<Router[]>("/api/routers", fetcher)
  // const socketRef = React.useRef<Socket | null>(null)

  const columns: ColumnDef<Router>[] = [
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
        <div className="font-mono">{row.index+1}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("status") === 1 ? '🟢 Online' : "🔴 Offline" }</div>
      ),
    },
    {
      accessorKey: "sitename",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Site Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("sitename")}</div>
      ),
    },
    {
      accessorKey: "ip",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            IP Address
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-mono">{row.getValue("ip")}</div>,
    },
    {
      accessorKey: "port_api",
      header: "API Port",
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue("port_api")}</div>
      ),
    },
    {
      accessorKey: "port_hst",
      header: "Host Port",
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue("port_hst")}</div>
      ),
    },
  
    
  ]
  // Initialize socket connection and handle status updates
  // React.useEffect(() => {
  //   // Initialize socket connection
  //   if (!socketRef.current) {
  //     socketRef.current = io('http://localhost:4000')
      
  //     socketRef.current.on('connect', () => {
  //       console.log('Socket connected')
  //     })

  //     socketRef.current.on('disconnect', () => {
  //       console.log('Socket disconnected')
  //     })

  //     socketRef.current.on('router-status', (statusUpdate: { id: number, status: number }) => {
  //       setRouterData(prevData => 
  //         prevData.map(router => 
  //           router.id === statusUpdate.id 
  //             ? { ...router, status: statusUpdate.status }
  //             : router
  //         )
  //       )
  //     })

  //     socketRef.current.on('connect_error', (error) => {
  //       console.error('Socket connection error:', error)
  //     })
  //   }

  //   return () => {
  //     // Don't disconnect on every cleanup, just remove listeners
  //     if (socketRef.current) {
  //       socketRef.current.off('router-status')
  //       socketRef.current.off('connect')
  //       socketRef.current.off('disconnect')
  //       socketRef.current.off('connect_error')
  //     }
  //   }
  // }, [])

  // // Update router data when SWR data changes
  // React.useEffect(() => {
  //   if (data) {
  //     setRouterData(data)
  //   }
  // }, [data])

  // // Cleanup socket on component unmount
  // React.useEffect(() => {
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect()
  //       socketRef.current = null
  //     }
  //   }
  // }, [])

  const table = useReactTable({
    data,
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
    return <div className="w-full p-4">Loading routers...</div>
  }

  // Show error state
  if (error) {
    return <div className="w-full p-4 text-red-500">Error loading routers: {error.message}</div>
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter by site name..."
          value={(table.getColumn("sitename")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("sitename")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => mutate()}
            > <RefreshCcwIcon/> Refresh </Button>
         
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

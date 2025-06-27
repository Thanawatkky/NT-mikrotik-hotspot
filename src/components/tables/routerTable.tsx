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
import { ArrowUpDown, MoreHorizontal, PlusCircleIcon, RefreshCcwIcon } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { showToast } from "../sweetalert/toaset"
import useSWR from "swr"
import Swal from "sweetalert2"

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

export function RouterDetailTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [sitename, setSitename] = React.useState("")
  const [ipAddress, setIpAddress] = React.useState("")
  const [portApi, setPortApi] = React.useState("8728")
  const [portHst, setPortHst] = React.useState("80")
  const [username, setUsername] = React.useState("admin")
  const [password, setPassword] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [routerData, setRouterData] = React.useState<Router[]>([])
  const { data, error, isLoading, mutate } = useSWR("/api/routers", fetcher)
  const socketRef = React.useRef<Socket | null>(null)

  const delRouter = async (routerId: number) => {

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then( async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/routers/${routerId}`, {
            method: "DELETE",
          })
    
          if (!response.ok) {
            const errorText = await response.text()
            console.error("API error:", response.status, errorText)
            showToast("Error deleting router.", "error")
            return
          }
    
          const result = await response.json()
          showToast(result.message || "Router deleted successfully!", "success")
          mutate() // Refresh the data
        } catch (error) {
          console.error("Network error:", error)
          showToast("Network error occurred.", "error")
        }
      }
    });
   
  }
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
        <div className="font-mono">{row.index + 1}</div>
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
  
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const router = row.original
  
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(router.ip)}
              >
                Copy IP Address
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(`${router.ip}:${router.port_api}`)}
              >
                Copy API Endpoint
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
          <DialogTrigger style={{ fontSize: "14px", marginLeft: "8px"}}>View Details</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ข้อมูล Router</DialogTitle>
              
            </DialogHeader>
            <div className="space-y-2">
                    <p><strong>Site:</strong> {row.original.sitename}</p>
                    <p><strong>IP:</strong> {row.original.ip}</p>
                    <p><strong>username:</strong> {row.original.username}</p>
                    <p><strong>API Port:</strong> {row.original.port_api}</p>
                    <p><strong>Host Port:</strong> {row.original.port_hst}</p>
                    <p><strong>Status:</strong> {row.original.status === 1 ? '🟢 Online' : '🔴 Offline'}</p>
                  </div>
          </DialogContent>
        </Dialog>
              <DropdownMenuItem className="text-red-600" onClick={() => delRouter(row.original.id)}>Delete Router</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
  // Initialize socket connection and handle status updates
  React.useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:4000')
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected')
      })

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      socketRef.current.on('router-status', (statusUpdate: { id: number, status: number }) => {
        setRouterData(prevData => 
          prevData.map(router => 
            router.id === statusUpdate.id 
              ? { ...router, status: statusUpdate.status }
              : router
          )
        )
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })
    }

    return () => {
      // Don't disconnect on every cleanup, just remove listeners
      if (socketRef.current) {
        socketRef.current.off('router-status')
        socketRef.current.off('connect')
        socketRef.current.off('disconnect')
        socketRef.current.off('connect_error')
      }
    }
  }, [])

  // Update router data when SWR data changes
  React.useEffect(() => {
    if (data) {
      setRouterData(data)
    }
  }, [data])

  // Cleanup socket on component unmount
  React.useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const table = useReactTable({
    data: routerData,
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
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
  
    if (!sitename || !ipAddress || !portApi || !portHst) {
      showToast("Please fill in all fields.", "error")
      return
    }

    // Basic IP address validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ipAddress)) {
      showToast("Please enter a valid IP address (e.g., 192.168.1.1)", "error")
      return
    }

    // Basic port validation
    const portRegex = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
    if (!portRegex.test(portApi)) {
      showToast("Please enter a valid API port (1-65535)", "error")
      return
    }
    if (!portRegex.test(portHst)) {
      showToast("Please enter a valid Host port (1-65535)", "error")
      return
    }
  
    try {
      const response = await fetch("/api/routers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sitename, 
          ip: ipAddress, 
          port_api: portApi, 
          port_hst: portHst,
          username,
          password,
        }),
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", response.status, errorText)
        showToast("Error submitting data.", "error")
        return
      }
  
      const result = await response.json()
      setSitename("")
      setIpAddress("")
      setPortApi("8728")
      setPortHst("80")
      setUsername("admin")
      setPassword("")
      setIsDialogOpen(false)
      showToast(result.message || "Router created successfully!", "success")
      mutate() // Refresh the data
    } catch (error) {
      console.error("Network error:", error)
      showToast("Network error occurred.", "error")
    }
  }

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"> <PlusCircleIcon /> Add Router</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Router</DialogTitle>
                  <DialogDescription>
                    Enter router details to add to the network
                  </DialogDescription>
                </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor="sitename">Site Name</Label>
                    <Input 
                      id="sitename" 
                      name="sitename" 
                      onChange={(e) => setSitename(e.target.value)} 
                      value={sitename} 
                      placeholder="Enter site name"
                    />
                  </div>
                <div className="grid gap-4 grid-cols-2 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input 
                      id="ipAddress" 
                      name="ipAddress" 
                      onChange={(e) => setIpAddress(e.target.value)} 
                      value={ipAddress} 
                      placeholder="192.168.1.1"
                      className="font-mono"
                    />
                  </div>
                
                  <div className="grid gap-2">
                    <Label htmlFor="portApi">API Port</Label>
                    <Input 
                      id="portApi" 
                      name="portApi" 
                      onChange={(e) => setPortApi(e.target.value)} 
                      value={portApi} 
                      placeholder="8080"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="portHst">Host Port</Label>
                    <Input 
                      id="portHst" 
                      name="portHst" 
                      onChange={(e) => setPortHst(e.target.value)} 
                      value={portHst} 
                      placeholder="8443"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username" 
                      onChange={(e) => setUsername(e.target.value)} 
                      value={username} 
                      placeholder="admin"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password"
                      onChange={(e) => setPassword(e.target.value)} 
                      value={password} 
                      className="font-mono"
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
import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search, MoreHorizontal, Eye, Ban, CheckCircle2, Clock, Filter, Loader2, RefreshCw
} from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { User } from "@/lib/api/types"
import { filterUsersByRole } from "@/lib/utils"

export const Route = createFileRoute('/console/drivers/')({
  component: DriversPage,
})

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <Badge variant="default" className="flex items-center gap-1 w-fit">
      <CheckCircle2 className="h-3 w-3" />
      Active
    </Badge>
  ) : (
    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
      <Clock className="h-3 w-3" />
      Inactive
    </Badge>
  )
}

function DriversPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [drivers, setDrivers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<number | null>(null)

  const fetchDrivers = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const users = await Api.getUsers()
      setDrivers(filterUsersByRole(users, "Driver"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch drivers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const handleToggleStatus = async (driver: User) => {
    setActionLoading(driver.id)
    try {
      await Api.adminUpdateUser(driver.id, { is_active: !driver.is_active })
      setDrivers((prev) =>
        prev.map((d) => d.id === driver.id ? { ...d, is_active: !driver.is_active } : d)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update driver status")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.id.toString().includes(searchQuery)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && driver.is_active) ||
      (statusFilter === "inactive" && !driver.is_active)
    return matchesSearch && matchesStatus
  })

  const activeCount = drivers.filter((d) => d.is_active).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">Manage and monitor all registered drivers</p>
        </div>
        <Button variant="outline" onClick={fetchDrivers} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : drivers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : drivers.length - activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : filteredDrivers.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All Drivers</CardTitle>
            <CardDescription>A list of all drivers and their current status</CardDescription>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search drivers by name, email, or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading drivers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">#{driver.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{driver.name}</div>
                      </TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{driver.role || "Driver"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(driver.is_active)}</TableCell>
                      <TableCell>
                        {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionLoading === driver.id}>
                              <span className="sr-only">Open menu</span>
                              {actionLoading === driver.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to="/console/drivers/$driverId" params={{ driverId: driver.id.toString() }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={driver.is_active ? "text-destructive" : "text-green-600"}
                              onClick={() => handleToggleStatus(driver)}
                            >
                              {driver.is_active ? (
                                <><Ban className="mr-2 h-4 w-4" />Deactivate</>
                              ) : (
                                <><CheckCircle2 className="mr-2 h-4 w-4" />Activate</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {drivers.length === 0 ? "No drivers found" : "No drivers match your search criteria"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

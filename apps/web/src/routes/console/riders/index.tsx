import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Loader2, RefreshCw, Ban, CheckCircle2 } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { User } from "@/lib/api/types"
import { filterUsersByRole } from "@/lib/utils"

export const Route = createFileRoute('/console/riders/')({
  component: RidersPage,
})

function RidersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [riders, setRiders] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<number | null>(null)

  const fetchRiders = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const users = await Api.getUsers()
      setRiders(filterUsersByRole(users, "Rider"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch riders")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchRiders()
  }, [fetchRiders])

  const handleToggleStatus = async (rider: User) => {
    setActionLoading(rider.id)
    try {
      await Api.adminUpdateUser(rider.id, { is_active: !rider.is_active })
      setRiders((prev) =>
        prev.map((r) => r.id === rider.id ? { ...r, is_active: !rider.is_active } : r)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update rider status")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRiders = riders.filter((rider) =>
    rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.id.toString().includes(searchQuery)
  )

  const activeCount = riders.filter((r) => r.is_active).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Riders</h2>
          <p className="text-muted-foreground">Manage and monitor all registered riders</p>
        </div>
        <Button variant="outline" onClick={fetchRiders} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : riders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Riders</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : riders.length - activeCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Riders</CardTitle>
          <CardDescription>A list of all riders and their activity</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search riders by name, email, or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading riders...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell className="font-medium">#{rider.id}</TableCell>
                      <TableCell className="font-medium">{rider.name}</TableCell>
                      <TableCell>{rider.email}</TableCell>
                      <TableCell>
                        <Badge variant={rider.is_active ? "default" : "secondary"}>
                          {rider.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rider.created_at ? new Date(rider.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionLoading === rider.id}>
                              {actionLoading === rider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to="/console/riders/$riderId" params={{ riderId: rider.id.toString() }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={rider.is_active ? "text-destructive" : "text-green-600"}
                              onClick={() => handleToggleStatus(rider)}
                            >
                              {rider.is_active ? (
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {riders.length === 0 ? "No riders found" : "No riders match your search criteria"}
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

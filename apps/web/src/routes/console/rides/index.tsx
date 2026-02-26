import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Loader2, RefreshCw, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { Ride, RideStatus } from "@/lib/api/types"

export const Route = createFileRoute('/console/rides/')({
  component: RidesPage,
})

const statusVariants: Record<RideStatus, "default" | "outline" | "destructive" | "secondary"> = {
  [RideStatus.REQUESTED]: "outline",
  [RideStatus.ACCEPTED]: "outline",
  [RideStatus.ARRIVED]: "outline",
  [RideStatus.IN_PROGRESS]: "secondary",
  [RideStatus.COMPLETED]: "default",
  [RideStatus.CANCELLED]: "destructive",
}

const statusLabels: Record<RideStatus, string> = {
  [RideStatus.REQUESTED]: "Requested",
  [RideStatus.ACCEPTED]: "Accepted",
  [RideStatus.ARRIVED]: "Arrived",
  [RideStatus.IN_PROGRESS]: "In Progress",
  [RideStatus.COMPLETED]: "Completed",
  [RideStatus.CANCELLED]: "Cancelled",
}

function getStatusBadge(status: RideStatus) {
  return (
    <Badge variant={statusVariants[status] ?? "outline"}>
      {statusLabels[status] ?? status}
    </Badge>
  )
}

function RidesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [rides, setRides] = React.useState<Ride[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRides = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await Api.getRides()
      setRides(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rides")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchRides()
  }, [fetchRides])

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.id.toString().includes(searchQuery) ||
      ride.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.dropoffAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.riderId?.toString().includes(searchQuery)
    const matchesStatus = statusFilter === "all" || ride.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const countByStatus = (status: RideStatus) => rides.filter((r) => r.status === status).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rides</h2>
          <p className="text-muted-foreground">Monitor and manage all ride activities</p>
        </div>
        <Button variant="outline" onClick={fetchRides} disabled={isLoading}>
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
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : rides.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : countByStatus(RideStatus.IN_PROGRESS)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : countByStatus(RideStatus.COMPLETED)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : countByStatus(RideStatus.CANCELLED)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rides</CardTitle>
          <CardDescription>Ride activities and their status</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ride ID, address, or rider ID..."
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
                {Object.values(RideStatus).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading rides...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ride ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rider ID</TableHead>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell className="font-medium">#{ride.id}</TableCell>
                      <TableCell>{new Date(ride.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>#{ride.riderId}</TableCell>
                      <TableCell>{ride.driverId ? `#${ride.driverId}` : <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px]">
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{ride.pickupAddress || `(${ride.pickupLatitude?.toFixed(4)}, ${ride.pickupLongitude?.toFixed(4)})`}</span>
                          </div>
                          <div className="text-muted-foreground truncate">→ {ride.dropoffAddress || `(${ride.dropoffLatitude?.toFixed(4)}, ${ride.dropoffLongitude?.toFixed(4)})`}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ride.fare != null ? `$${ride.fare.toFixed(2)}` : <span className="text-muted-foreground">N/A</span>}</TableCell>
                      <TableCell>{ride.distance != null ? `${ride.distance.toFixed(1)} km` : <span className="text-muted-foreground">N/A</span>}</TableCell>
                      <TableCell>{getStatusBadge(ride.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {rides.length === 0 ? "No rides found" : "No rides match your search criteria"}
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

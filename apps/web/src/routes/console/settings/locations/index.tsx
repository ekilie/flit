import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { MapPin, Loader2, RefreshCw, Plus, X, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"

export const Route = createFileRoute('/console/settings/locations/')({
  component: LocationsSettingsPage,
})

interface LocationRecord {
  id: number
  latitude: number
  longitude: number
  accuracy?: number
  userId: number
  rideId?: number
  createdAt: string
}

interface NewLocationForm {
  name: string
  latitude: string
  longitude: string
  description: string
}

const defaultForm: NewLocationForm = {
  name: "",
  latitude: "",
  longitude: "",
  description: "",
}

// Static known service areas (since the API just stores location points per user/ride)
const defaultServiceAreas = [
  { id: 1, name: "Dar es Salaam City Center", latitude: -6.7924, longitude: 39.2083, radius: 15, status: "active" },
  { id: 2, name: "Julius Nyerere International Airport", latitude: -6.8780, longitude: 39.2026, radius: 3, status: "active" },
  { id: 3, name: "Kariakoo Market Area", latitude: -6.8161, longitude: 39.2810, radius: 2, status: "active" },
]

type ServiceArea = typeof defaultServiceAreas[0]

function LocationsSettingsPage() {
  const [recentLocations, setRecentLocations] = React.useState<LocationRecord[]>([])
  const [serviceAreas, setServiceAreas] = React.useState<ServiceArea[]>(defaultServiceAreas)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState<NewLocationForm>(defaultForm)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch recent ride locations from the rides API as a proxy for location data
      const rides = await Api.getRides()
      // Convert ride location data to location records
      const locations: LocationRecord[] = rides.slice(0, 20).map((ride) => ({
        id: ride.id,
        latitude: ride.pickupLatitude,
        longitude: ride.pickupLongitude,
        userId: ride.riderId,
        rideId: ride.id,
        createdAt: ride.createdAt,
      }))
      setRecentLocations(locations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch location data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Areas</h2>
          <p className="text-muted-foreground">Configure and monitor geographical service zones</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Areas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{serviceAreas.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceAreas.filter((a) => a.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Pickup Locations</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : recentLocations.length}</div></CardContent>
        </Card>
      </div>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configured Service Areas</CardTitle>
              <CardDescription>Geographic zones where the service is available</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">New Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Area Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mikocheni Business District" />
                  </div>
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input type="number" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.7924" />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input type="number" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="39.2083" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the area" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button onClick={() => {
                    if (form.name && form.latitude && form.longitude) {
                      setServiceAreas((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          name: form.name,
                          latitude: parseFloat(form.latitude),
                          longitude: parseFloat(form.longitude),
                          radius: 5,
                          status: "active",
                        },
                      ])
                    }
                    setShowForm(false)
                    setForm(defaultForm)
                  }}>
                    <Check className="mr-2 h-4 w-4" />
                    Add Area
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setForm(defaultForm) }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area Name</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Coverage Radius</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell className="font-mono text-xs">{area.latitude}, {area.longitude}</TableCell>
                  <TableCell>{area.radius} km</TableCell>
                  <TableCell>
                    <Badge variant={area.status === "active" ? "default" : "secondary"}>
                      {area.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Ride Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pickup Locations</CardTitle>
          <CardDescription>Latest pickup coordinates from ride requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading location data...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ride ID</TableHead>
                  <TableHead>Rider ID</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLocations.length > 0 ? recentLocations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">#{loc.rideId}</TableCell>
                    <TableCell>#{loc.userId}</TableCell>
                    <TableCell className="font-mono text-xs">{loc.latitude?.toFixed(6)}</TableCell>
                    <TableCell className="font-mono text-xs">{loc.longitude?.toFixed(6)}</TableCell>
                    <TableCell>{new Date(loc.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No location data available</TableCell>
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

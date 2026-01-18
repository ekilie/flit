"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Eye, MapPin, Calendar } from "lucide-react"

const mockRides = [
  { id: "R-1234", date: "2024-12-29", driver: "John Doe", rider: "Alice Johnson", from: "Downtown", to: "Airport", fare: 45.0, status: "completed", duration: "25 min" },
  { id: "R-1235", date: "2024-12-29", driver: "Jane Smith", rider: "Bob Williams", from: "Mall", to: "Hotel", fare: 28.0, status: "completed", duration: "15 min" },
  { id: "R-1236", date: "2024-12-29", driver: "Mike Johnson", rider: "Carol Davis", from: "Airport", to: "Downtown", fare: 52.0, status: "in_progress", duration: "Ongoing" },
  { id: "R-1237", date: "2024-12-29", driver: "Sarah Williams", rider: "David Brown", from: "Hotel", to: "Restaurant", fare: 18.0, status: "cancelled", duration: "N/A" },
]

function getStatusBadge(status: string) {
  const variants = {
    completed: { variant: "default" as const, label: "Completed" },
    in_progress: { variant: "outline" as const, label: "In Progress" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
  }
  const config = variants[status as keyof typeof variants]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function RidesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rides</h2>
          <p className="text-muted-foreground">Monitor and manage all ride activities</p>
        </div>
        <Link href="/console/rides/analytics">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">210</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rides</CardTitle>
          <CardDescription>Recent ride activities and their status</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rides..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ride ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="font-medium">{ride.id}</TableCell>
                  <TableCell>{new Date(ride.date).toLocaleDateString()}</TableCell>
                  <TableCell>{ride.driver}</TableCell>
                  <TableCell>{ride.rider}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ride.from}
                      </div>
                      <div className="text-muted-foreground">→ {ride.to}</div>
                    </div>
                  </TableCell>
                  <TableCell>{ride.duration}</TableCell>
                  <TableCell>${ride.fare.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(ride.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/console/rides/${ride.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

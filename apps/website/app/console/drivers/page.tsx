"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  Clock,
  Filter
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type DriverStatus = "active" | "offline" | "suspended" | "pending"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  status: DriverStatus
  rating: number
  totalRides: number
  earnings: number
  vehicle: string
  joinedDate: string
}

const mockDrivers: Driver[] = [
  {
    id: "DRV-001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234-567-8901",
    status: "active",
    rating: 4.8,
    totalRides: 1250,
    earnings: 15600,
    vehicle: "Toyota Camry 2022",
    joinedDate: "2024-01-15",
  },
  {
    id: "DRV-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 234-567-8902",
    status: "active",
    rating: 4.9,
    totalRides: 980,
    earnings: 12800,
    vehicle: "Honda Accord 2023",
    joinedDate: "2024-02-20",
  },
  {
    id: "DRV-003",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+1 234-567-8903",
    status: "offline",
    rating: 4.6,
    totalRides: 750,
    earnings: 9500,
    vehicle: "Nissan Altima 2021",
    joinedDate: "2024-03-10",
  },
  {
    id: "DRV-004",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+1 234-567-8904",
    status: "pending",
    rating: 0,
    totalRides: 0,
    earnings: 0,
    vehicle: "Ford Fusion 2022",
    joinedDate: "2024-12-28",
  },
  {
    id: "DRV-005",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1 234-567-8905",
    status: "suspended",
    rating: 3.8,
    totalRides: 320,
    earnings: 3200,
    vehicle: "Chevrolet Malibu 2020",
    joinedDate: "2024-05-15",
  },
]

function getStatusBadge(status: DriverStatus) {
  const variants = {
    active: { variant: "default" as const, icon: CheckCircle2, label: "Active" },
    offline: { variant: "secondary" as const, icon: Clock, label: "Offline" },
    suspended: { variant: "destructive" as const, icon: Ban, label: "Suspended" },
    pending: { variant: "outline" as const, icon: Clock, label: "Pending" },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredDrivers = mockDrivers.filter((driver) => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">
            Manage and monitor all registered drivers
          </p>
        </div>
        <Link href="/console/drivers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDrivers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDrivers.filter((d) => d.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDrivers.filter((d) => d.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                mockDrivers
                  .filter((d) => d.rating > 0)
                  .reduce((acc, d) => acc + d.rating, 0) /
                mockDrivers.filter((d) => d.rating > 0).length
              ).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Drivers</CardTitle>
              <CardDescription>
                A list of all drivers and their current status
              </CardDescription>
            </div>
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
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Total Rides</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Joined {new Date(driver.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.email}</div>
                        <div className="text-muted-foreground">{driver.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{driver.vehicle}</TableCell>
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell>
                      {driver.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{driver.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{driver.totalRides.toLocaleString()}</TableCell>
                    <TableCell>${driver.earnings.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/console/drivers/${driver.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/console/drivers/${driver.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Driver
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/console/drivers/${driver.id}/documents`}>
                              View Documents
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Driver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No drivers found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

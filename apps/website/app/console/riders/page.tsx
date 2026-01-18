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
import { Plus, Search, MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockRiders = [
  { id: "RDR-001", name: "Alice Johnson", email: "alice@example.com", phone: "+1 234-567-8911", totalRides: 45, spent: 1250, joinedDate: "2024-03-10" },
  { id: "RDR-002", name: "Bob Williams", email: "bob@example.com", phone: "+1 234-567-8912", totalRides: 32, spent: 890, joinedDate: "2024-04-15" },
  { id: "RDR-003", name: "Carol Davis", email: "carol@example.com", phone: "+1 234-567-8913", totalRides: 78, spent: 2100, joinedDate: "2024-02-20" },
]

export default function RidersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Riders</h2>
          <p className="text-muted-foreground">Manage and monitor all registered riders</p>
        </div>
        <Link href="/console/riders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Rider
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRiders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,280</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Riders</CardTitle>
          <CardDescription>A list of all riders and their activity</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search riders..."
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
                <TableHead>Rider ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Rides</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRiders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell className="font-medium">{rider.id}</TableCell>
                  <TableCell>{rider.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rider.email}</div>
                      <div className="text-muted-foreground">{rider.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{rider.totalRides}</TableCell>
                  <TableCell>${rider.spent}</TableCell>
                  <TableCell>{new Date(rider.joinedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/console/riders/${rider.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

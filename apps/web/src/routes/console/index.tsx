import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export const Route = createFileRoute('/console/')({
  component: DashboardPage,
})

const ridesData = [
  { name: "Mon", rides: 65, revenue: 4500 },
  { name: "Tue", rides: 78, revenue: 5200 },
  { name: "Wed", rides: 90, revenue: 6100 },
  { name: "Thu", rides: 81, revenue: 5800 },
  { name: "Fri", rides: 95, revenue: 6800 },
  { name: "Sat", rides: 120, revenue: 8500 },
  { name: "Sun", rides: 105, revenue: 7200 },
]

const driverStatusData = [
  { name: "Online", value: 145 },
  { name: "Busy", value: 78 },
  { name: "Offline", value: 82 },
]

interface MetricCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
}

function MetricCard({ title, value, change, isPositive, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
          <span>from last week</span>
        </p>
      </CardContent>
    </Card>
  )
}

interface ActivityItem {
  id: string
  type: "ride" | "driver" | "payment"
  message: string
  time: string
}

const recentActivity: ActivityItem[] = [
  { id: "1", type: "ride", message: "New ride completed: #R-1234", time: "2 minutes ago" },
  { id: "2", type: "driver", message: "Driver John Doe went online", time: "5 minutes ago" },
  { id: "3", type: "payment", message: "Payment processed: $45.00", time: "10 minutes ago" },
  { id: "4", type: "ride", message: "New ride started: #R-1235", time: "15 minutes ago" },
  { id: "5", type: "driver", message: "New driver registered: Jane Smith", time: "1 hour ago" },
]

function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>View All Rides</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Rides Today" value="234" change="+12.5%" isPositive={true} icon={<Car className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Active Drivers" value="145" change="+5.2%" isPositive={true} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Revenue Today" value="$12,458" change="+18.7%" isPositive={true} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Average Rating" value="4.8" change="-0.2%" isPositive={false} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Rides & Revenue Overview</CardTitle>
            <CardDescription>Weekly performance of rides and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ridesData}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                <Legend />
                <Area type="monotone" dataKey="rides" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRides)" name="Rides" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {activity.type === "ride" && <Car className="h-4 w-4 text-primary" />}
                    {activity.type === "driver" && <Users className="h-4 w-4 text-primary" />}
                    {activity.type === "payment" && <DollarSign className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Status Distribution</CardTitle>
          <CardDescription>Current status of all registered drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={driverStatusData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Drivers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Users className="h-6 w-6" />
              Add New Driver
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Car className="h-6 w-6" />
              Register Vehicle
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Activity className="h-6 w-6" />
              View Live Rides
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <DollarSign className="h-6 w-6" />
              Process Payout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

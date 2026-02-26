import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Star,
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
import Api from "@/lib/api"
import { RideStatus, PaymentStatus } from "@/lib/api/types"
import { filterUsersByRole } from "@/lib/utils"

export const Route = createFileRoute('/console/')({
  component: DashboardPage,
})

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon: React.ReactNode
  isLoading?: boolean
}

function MetricCard({ title, value, change, isPositive, icon, isLoading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalDrivers: 0,
    totalRiders: 0,
    totalRides: 0,
    completedRides: 0,
    inProgressRides: 0,
    cancelledRides: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalVehicles: 0,
    pendingPayments: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [users, rides, payments, ratings, vehicles] = await Promise.allSettled([
        Api.getUsers(),
        Api.getRides(),
        Api.getPayments(),
        Api.getRatings(),
        Api.getVehicles(),
      ])

      const usersData = users.status === "fulfilled" ? users.value : []
      const ridesData = rides.status === "fulfilled" ? rides.value : []
      const paymentsData = payments.status === "fulfilled" ? payments.value : []
      const ratingsData = ratings.status === "fulfilled" ? ratings.value : []
      const vehiclesData = vehicles.status === "fulfilled" ? vehicles.value : []

      const drivers = filterUsersByRole(Array.isArray(usersData) ? usersData : [], "Driver")
      const riders = filterUsersByRole(Array.isArray(usersData) ? usersData : [], "Rider")
      const ridesArr = Array.isArray(ridesData) ? ridesData : []
      const paymentsArr = Array.isArray(paymentsData) ? paymentsData : []
      const ratingsArr = Array.isArray(ratingsData) ? ratingsData : []
      const vehiclesArr = Array.isArray(vehiclesData) ? vehiclesData : []

      const completedRevenue = paymentsArr
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0)

      const avgRating = ratingsArr.length > 0
        ? ratingsArr.reduce((sum, r) => sum + r.rating, 0) / ratingsArr.length
        : 0

      setStats({
        totalDrivers: drivers.length,
        totalRiders: riders.length,
        totalRides: ridesArr.length,
        completedRides: ridesArr.filter((r) => r.status === RideStatus.COMPLETED).length,
        inProgressRides: ridesArr.filter((r) => r.status === RideStatus.IN_PROGRESS).length,
        cancelledRides: ridesArr.filter((r) => r.status === RideStatus.CANCELLED).length,
        totalRevenue: completedRevenue,
        averageRating: avgRating,
        totalVehicles: vehiclesArr.length,
        pendingPayments: paymentsArr.filter((p) => p.status === PaymentStatus.PENDING).length,
      })
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Drivers"
          value={stats.totalDrivers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Riders"
          value={stats.totalRiders}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Rides"
          value={stats.totalRides}
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Rides In Progress"
          value={stats.inProgressRides}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Completed Rides"
          value={stats.completedRides}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Average Rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(2) : "N/A"}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ride Status Summary</CardTitle>
            <CardDescription>Distribution of rides by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: "In Progress", value: stats.inProgressRides },
                  { name: "Completed", value: stats.completedRides },
                  { name: "Cancelled", value: stats.cancelledRides },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Rides" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Total Drivers", value: stats.totalDrivers, color: "bg-blue-500" },
                { label: "Total Riders", value: stats.totalRiders, color: "bg-green-500" },
                { label: "Total Vehicles", value: stats.totalVehicles, color: "bg-yellow-500" },
                { label: "Total Rides", value: stats.totalRides, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="font-medium">
                    {isLoading ? "..." : item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to key admin areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/console/drivers">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Users className="h-6 w-6" />
                Manage Drivers
              </Button>
            </Link>
            <Link to="/console/vehicles">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Car className="h-6 w-6" />
                Manage Vehicles
              </Button>
            </Link>
            <Link to="/console/rides">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Activity className="h-6 w-6" />
                View Rides
              </Button>
            </Link>
            <Link to="/console/settings/pricing">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <DollarSign className="h-6 w-6" />
                Pricing Config
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

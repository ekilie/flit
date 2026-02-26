import { createFileRoute } from '@tanstack/react-router'
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DollarSign, Search, Loader2, RefreshCw, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { Payment, PaymentStatus, PaymentMethod } from "@/lib/api/types"

export const Route = createFileRoute('/console/payments/')({
  component: PaymentsPage,
})

const statusVariants: Record<PaymentStatus, "default" | "outline" | "destructive" | "secondary"> = {
  [PaymentStatus.COMPLETED]: "default",
  [PaymentStatus.PENDING]: "outline",
  [PaymentStatus.PROCESSING]: "secondary",
  [PaymentStatus.FAILED]: "destructive",
  [PaymentStatus.REFUNDED]: "secondary",
}

function PaymentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchPayments = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await Api.getPayments()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payments")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toString().includes(searchQuery) ||
      p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userId?.toString().includes(searchQuery)
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingCount = payments.filter((p) => p.status === PaymentStatus.PENDING).length
  const refundedAmount = payments
    .filter((p) => p.status === PaymentStatus.REFUNDED)
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage transactions and financial activities</p>
        </div>
        <Button variant="outline" onClick={fetchPayments} disabled={isLoading}>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : `$${totalRevenue.toFixed(2)}`}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : payments.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : pendingCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : `$${refundedAmount.toFixed(2)}`}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Payment activities and transactions</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, transaction ID, or user ID..."
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
                {Object.values(PaymentStatus).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading payments...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ride ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>#{payment.rideId}</TableCell>
                      <TableCell>#{payment.userId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{payment.method}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[payment.status] ?? "outline"} className="capitalize">
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.transactionId || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {payments.length === 0 ? "No payments found" : "No payments match your search criteria"}
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

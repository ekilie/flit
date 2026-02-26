import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Search, TrendingUp } from "lucide-react"

export const Route = createFileRoute('/console/payments/')({
  component: PaymentsPage,
})

const mockPayments = [
  { id: "PAY-001", date: "2024-12-29", type: "ride", amount: 45.0, driver: "John Doe", rider: "Alice Johnson", status: "completed" },
  { id: "PAY-002", date: "2024-12-29", type: "ride", amount: 28.0, driver: "Jane Smith", rider: "Bob Williams", status: "completed" },
  { id: "PAY-003", date: "2024-12-28", type: "refund", amount: -18.0, driver: "Mike Johnson", rider: "Carol Davis", status: "processed" },
  { id: "PAY-004", date: "2024-12-28", type: "payout", amount: 850.0, driver: "John Doe", rider: "N/A", status: "pending" },
]

function PaymentsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage transactions and financial activities</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">$12,458</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">$8,540</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">$245</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">$2,491</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>All payment activities and transactions</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search transactions..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{payment.type}</TableCell>
                  <TableCell>{payment.driver}</TableCell>
                  <TableCell>{payment.rider}</TableCell>
                  <TableCell className={payment.amount < 0 ? "text-red-500" : ""}>
                    ${Math.abs(payment.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "completed" ? "default" : "outline"}>
                      {payment.status}
                    </Badge>
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

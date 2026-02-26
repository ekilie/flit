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
import { AlertTriangle, Search, Loader2, RefreshCw, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { Rating, RatingType } from "@/lib/api/types"

export const Route = createFileRoute('/console/support/reports/')({
  component: ReportsPage,
})

function ReportsPage() {
  const [lowRatings, setLowRatings] = React.useState<Rating[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState<string>("all")

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const ratings = await Api.getRatings()
      // Show ratings with complaints (ratings <= 3 are considered problematic)
      const issues = Array.isArray(ratings) ? ratings.filter((r) => r.rating <= 3) : []
      setLowRatings(issues)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  const filteredReports = lowRatings.filter((r) => {
    const matchesSearch =
      r.id.toString().includes(searchQuery) ||
      r.fromUserId.toString().includes(searchQuery) ||
      r.toUserId.toString().includes(searchQuery) ||
      r.rideId.toString().includes(searchQuery) ||
      r.review?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "1" && r.rating === 1) ||
      (ratingFilter === "2" && r.rating === 2) ||
      (ratingFilter === "3" && r.rating === 3)
    return matchesSearch && matchesRating
  })

  const criticalCount = lowRatings.filter((r) => r.rating === 1).length
  const warningCount = lowRatings.filter((r) => r.rating === 2).length
  const lowCount = lowRatings.filter((r) => r.rating === 3).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Reports</h2>
          <p className="text-muted-foreground">Monitor low ratings and potential complaints</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : lowRatings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical (★1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{isLoading ? "..." : criticalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning (★2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{isLoading ? "..." : warningCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low (★3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{isLoading ? "..." : lowCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Rating Reports</CardTitle>
          <CardDescription>Rides with ratings of 3 stars or below that may require attention</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user ID, or review..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="1">★ 1 Star</SelectItem>
                <SelectItem value="2">★★ 2 Stars</SelectItem>
                <SelectItem value="3">★★★ 3 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading reports...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating ID</TableHead>
                  <TableHead>Ride ID</TableHead>
                  <TableHead>From User</TableHead>
                  <TableHead>To User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">#{report.id}</TableCell>
                    <TableCell>#{report.rideId}</TableCell>
                    <TableCell>User #{report.fromUserId}</TableCell>
                    <TableCell>User #{report.toUserId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {report.type === RatingType.RIDER_TO_DRIVER ? "Rider → Driver" : "Driver → Rider"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {"★".repeat(report.rating)}{"☆".repeat(5 - report.rating)}
                        <span className="ml-1 text-sm">{report.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.review || <span className="text-muted-foreground italic">No review</span>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={report.rating === 1 ? "destructive" : report.rating === 2 ? "outline" : "secondary"}
                      >
                        {report.rating === 1 ? "Critical" : report.rating === 2 ? "Warning" : "Low"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {lowRatings.length === 0
                        ? "No low ratings found — great job!"
                        : "No reports match your search criteria"}
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

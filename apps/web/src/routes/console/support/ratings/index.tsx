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
import { Star, Search, Loader2, RefreshCw, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { Rating, RatingType } from "@/lib/api/types"

export const Route = createFileRoute('/console/support/ratings/')({
  component: RatingsPage,
})

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

function RatingsPage() {
  const [ratings, setRatings] = React.useState<Rating[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")

  const fetchRatings = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await Api.getRatings()
      setRatings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ratings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchRatings() }, [fetchRatings])

  const filteredRatings = ratings.filter((r) => {
    const matchesSearch =
      r.id.toString().includes(searchQuery) ||
      r.fromUserId.toString().includes(searchQuery) ||
      r.toUserId.toString().includes(searchQuery) ||
      r.review?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || r.type === typeFilter
    return matchesSearch && matchesType
  })

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
    : "N/A"

  const riderToDriverAvg = ratings.filter((r) => r.type === RatingType.RIDER_TO_DRIVER)
  const driverToRiderAvg = ratings.filter((r) => r.type === RatingType.DRIVER_TO_RIDER)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ratings & Reviews</h2>
          <p className="text-muted-foreground">Monitor all driver and rider ratings</p>
        </div>
        <Button variant="outline" onClick={fetchRatings} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : ratings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : avgRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rider → Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : riderToDriverAvg.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver → Rider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : driverToRiderAvg.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ratings</CardTitle>
          <CardDescription>Complete list of ratings and reviews</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user ID, review text..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={RatingType.RIDER_TO_DRIVER}>Rider → Driver</SelectItem>
                <SelectItem value={RatingType.DRIVER_TO_RIDER}>Driver → Rider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading ratings...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Ride</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatings.length > 0 ? filteredRatings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell className="font-medium">#{rating.id}</TableCell>
                    <TableCell>User #{rating.fromUserId}</TableCell>
                    <TableCell>User #{rating.toUserId}</TableCell>
                    <TableCell>#{rating.rideId}</TableCell>
                    <TableCell><StarDisplay rating={rating.rating} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {rating.type === RatingType.RIDER_TO_DRIVER ? "Rider → Driver" : "Driver → Rider"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {rating.review || <span className="italic">No review</span>}
                    </TableCell>
                    <TableCell>{new Date(rating.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {ratings.length === 0 ? "No ratings found" : "No ratings match your search criteria"}
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

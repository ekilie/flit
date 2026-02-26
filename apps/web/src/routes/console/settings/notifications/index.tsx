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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Bell, Loader2, RefreshCw, Plus, X, Check, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { Notification, CreateNotificationDto, NotificationType } from "@/lib/api/types"

export const Route = createFileRoute('/console/settings/notifications/')({
  component: NotificationsSettingsPage,
})

const defaultForm: CreateNotificationDto = {
  title: "",
  message: "",
  type: NotificationType.SYSTEM,
  userId: 0,
}

function NotificationsSettingsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState<CreateNotificationDto>(defaultForm)
  const [actionLoading, setActionLoading] = React.useState(false)

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await Api.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchNotifications() }, [fetchNotifications])

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleCreate = async () => {
    if (!form.title || !form.message || !form.userId) {
      setError("Please fill in all required fields (title, message, user ID)")
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      const created = await Api.createNotification(form)
      setNotifications((prev) => [created, ...prev])
      setShowForm(false)
      setForm(defaultForm)
      setSuccess("Notification sent successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await Api.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setSuccess("Notification deleted")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification")
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Management</h2>
          <p className="text-muted-foreground">Send and manage system notifications</p>
        </div>
        <Button variant="outline" onClick={fetchNotifications} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription className="text-green-700">{success}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : notifications.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : unreadCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "..." : notifications.length - unreadCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>System and user notifications</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Send New Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title <span className="text-destructive">*</span></Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID <span className="text-destructive">*</span></Label>
                    <Input type="number" value={form.userId || ""} onChange={(e) => setForm({ ...form, userId: parseInt(e.target.value) || 0 })} placeholder="Target user ID" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Message <span className="text-destructive">*</span></Label>
                    <Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Notification message" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as NotificationType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(NotificationType).map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button onClick={handleCreate} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Send
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setForm(defaultForm) }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading notifications...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">#{n.id}</TableCell>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{n.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {n.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>#{n.userId}</TableCell>
                    <TableCell>
                      <Badge variant={n.isRead ? "secondary" : "default"}>
                        {n.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(n.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No notifications found</TableCell>
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

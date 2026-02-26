import { createFileRoute } from '@tanstack/react-router'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon, DollarSign, MapPin, Bell } from "lucide-react"
import { Link } from "@tanstack/react-router"

export const Route = createFileRoute('/console/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage system configuration and preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/console/settings/pricing">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>Manage pricing rules and surge pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/console/settings/locations">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Service Areas</CardTitle>
                  <CardDescription>Configure geographical service zones</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/console/settings/notifications">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>Manage email and SMS templates</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>App configuration and business rules</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

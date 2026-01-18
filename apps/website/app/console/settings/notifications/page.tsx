"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsSettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/console/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Templates</h2>
          <p className="text-muted-foreground">Manage email and SMS templates</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Configure notification templates for different events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification templates will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

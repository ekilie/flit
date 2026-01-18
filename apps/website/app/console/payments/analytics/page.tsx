"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentAnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/console/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Analytics</h2>
          <p className="text-muted-foreground">Revenue reports and financial insights</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Financial performance and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Financial analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

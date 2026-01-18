"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentDisputesPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/console/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Disputes</h2>
          <p className="text-muted-foreground">Handle payment disputes and chargebacks</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
          <CardDescription>Manage ongoing payment disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Payment disputes will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

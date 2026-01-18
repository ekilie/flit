"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/console/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Reports</h2>
          <p className="text-muted-foreground">Handle reports of inappropriate behavior</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Reports</CardTitle>
          <CardDescription>Reports requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User reports will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

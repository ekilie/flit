"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewRiderPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/console/riders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add New Rider</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rider Information</CardTitle>
          <CardDescription>Register a new rider to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Rider registration form will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

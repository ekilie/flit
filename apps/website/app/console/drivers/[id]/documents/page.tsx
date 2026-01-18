"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"

const documents = [
  {
    id: 1,
    name: "Driver's License",
    type: "license",
    status: "verified",
    uploadDate: "2024-01-15",
    expiryDate: "2026-05-15",
    fileUrl: "#",
  },
  {
    id: 2,
    name: "Vehicle Insurance",
    type: "insurance",
    status: "verified",
    uploadDate: "2024-01-15",
    expiryDate: "2025-03-20",
    fileUrl: "#",
  },
  {
    id: 3,
    name: "Vehicle Registration",
    type: "registration",
    status: "verified",
    uploadDate: "2024-01-15",
    expiryDate: "2025-12-31",
    fileUrl: "#",
  },
  {
    id: 4,
    name: "Background Check",
    type: "background",
    status: "pending",
    uploadDate: "2024-12-28",
    expiryDate: "2025-01-15",
    fileUrl: "#",
  },
]

function getStatusBadge(status: string) {
  const config = {
    verified: { variant: "default" as const, icon: CheckCircle2, label: "Verified" },
    pending: { variant: "outline" as const, icon: Clock, label: "Pending Review" },
    expired: { variant: "destructive" as const, icon: AlertCircle, label: "Expired" },
  }

  const statusConfig = config[status as keyof typeof config] || config.pending
  const Icon = statusConfig.icon

  return (
    <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {statusConfig.label}
    </Badge>
  )
}

export default function DriverDocumentsPage() {
  const params = useParams()
  const driverId = params.id

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/console/drivers/${driverId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Driver Documents</h2>
            <p className="text-muted-foreground">Driver ID: {driverId}</p>
          </div>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <CardDescription>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-medium">{new Date(doc.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

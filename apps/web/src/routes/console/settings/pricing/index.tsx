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
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, Loader2, RefreshCw, Edit, Zap, Trash2, X, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Api from "@/lib/api"
import { PricingConfig, SurgeZone, CreatePricingConfigDto, CreateSurgeZoneDto } from "@/lib/api/types"

export const Route = createFileRoute('/console/settings/pricing/')({
  component: PricingPage,
})

const defaultPricingForm: CreatePricingConfigDto = {
  vehicleType: "",
  baseFare: 0,
  perKmRate: 0,
  perMinuteRate: 0,
  minimumFare: 0,
  bookingFee: 0,
  cancellationFee: 0,
  isActive: true,
}

const defaultSurgeForm: CreateSurgeZoneDto = {
  name: "",
  centerLatitude: 0,
  centerLongitude: 0,
  radiusKm: 1,
  surgeMultiplier: 1.5,
  isActive: true,
}

interface PricingFormProps {
  form: CreatePricingConfigDto
  editing: boolean
  onSave: () => void
  onCancel: () => void
  onChange: (form: CreatePricingConfigDto) => void
  loading: boolean
}

function PricingForm({ form, editing, onSave, onCancel, onChange, loading }: PricingFormProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">{editing ? "Edit Configuration" : "New Configuration"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            {editing ? (
              <div className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm font-medium capitalize">
                {form.vehicleType}
              </div>
            ) : (
              <Input
                value={form.vehicleType}
                onChange={(e) => onChange({ ...form, vehicleType: e.target.value })}
                placeholder="e.g. economy"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Base Fare ($)</Label>
            <Input type="number" value={form.baseFare} onChange={(e) => onChange({ ...form, baseFare: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Per KM Rate ($)</Label>
            <Input type="number" value={form.perKmRate} onChange={(e) => onChange({ ...form, perKmRate: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Per Minute Rate ($)</Label>
            <Input type="number" value={form.perMinuteRate} onChange={(e) => onChange({ ...form, perMinuteRate: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Minimum Fare ($)</Label>
            <Input type="number" value={form.minimumFare} onChange={(e) => onChange({ ...form, minimumFare: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Booking Fee ($)</Label>
            <Input type="number" value={form.bookingFee ?? 0} onChange={(e) => onChange({ ...form, bookingFee: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Cancellation Fee ($)</Label>
            <Input type="number" value={form.cancellationFee ?? 0} onChange={(e) => onChange({ ...form, cancellationFee: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {editing ? "Update" : "Create"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface SurgeFormProps {
  form: CreateSurgeZoneDto
  onSave: () => void
  onCancel: () => void
  onChange: (form: CreateSurgeZoneDto) => void
  loading: boolean
}

function SurgeForm({ form, onSave, onCancel, onChange, loading }: SurgeFormProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">New Surge Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-3">
            <Label>Zone Name</Label>
            <Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="e.g. City Center" />
          </div>
          <div className="space-y-2">
            <Label>Center Latitude</Label>
            <Input type="number" value={form.centerLatitude} onChange={(e) => onChange({ ...form, centerLatitude: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Center Longitude</Label>
            <Input type="number" value={form.centerLongitude} onChange={(e) => onChange({ ...form, centerLongitude: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Radius (km)</Label>
            <Input type="number" value={form.radiusKm} onChange={(e) => onChange({ ...form, radiusKm: parseFloat(e.target.value) || 1 })} />
          </div>
          <div className="space-y-2">
            <Label>Surge Multiplier (1.0–5.0)</Label>
            <Input type="number" step="0.1" min="1" max="5" value={form.surgeMultiplier} onChange={(e) => onChange({ ...form, surgeMultiplier: parseFloat(e.target.value) || 1.5 })} />
          </div>
          <div className="space-y-2">
            <Label>Start Time (optional)</Label>
            <Input type="datetime-local" onChange={(e) => onChange({ ...form, startTime: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </div>
          <div className="space-y-2">
            <Label>End Time (optional)</Label>
            <Input type="datetime-local" onChange={(e) => onChange({ ...form, endTime: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Create Zone
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PricingPage() {
  const [configs, setConfigs] = React.useState<PricingConfig[]>([])
  const [surgeZones, setSurgeZones] = React.useState<SurgeZone[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [pricingForm, setPricingForm] = React.useState<CreatePricingConfigDto>(defaultPricingForm)
  const [surgeForm, setSurgeForm] = React.useState<CreateSurgeZoneDto>(defaultSurgeForm)
  const [showPricingForm, setShowPricingForm] = React.useState(false)
  const [showSurgeForm, setShowSurgeForm] = React.useState(false)
  const [editingConfig, setEditingConfig] = React.useState<PricingConfig | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [configData, surgeData] = await Promise.all([
        Api.getPricingConfigs(),
        Api.getSurgeZones(),
      ])
      setConfigs(configData)
      setSurgeZones(surgeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pricing data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleEditConfig = (config: PricingConfig) => {
    setEditingConfig(config)
    setPricingForm({
      vehicleType: config.vehicleType,
      baseFare: config.baseFare,
      perKmRate: config.perKmRate,
      perMinuteRate: config.perMinuteRate,
      minimumFare: config.minimumFare,
      bookingFee: config.bookingFee,
      cancellationFee: config.cancellationFee,
      isActive: config.isActive,
    })
    setShowPricingForm(true)
  }

  const handleSavePricingConfig = async () => {
    setActionLoading(true)
    setError(null)
    try {
      if (editingConfig) {
        const updated = await Api.updatePricingConfig(editingConfig.vehicleType, pricingForm)
        setConfigs((prev) => prev.map((c) => c.vehicleType === editingConfig.vehicleType ? updated : c))
        setSuccess("Pricing configuration updated successfully")
      } else {
        const created = await Api.createPricingConfig(pricingForm)
        setConfigs((prev) => [...prev, created])
        setSuccess("Pricing configuration created successfully")
      }
      setShowPricingForm(false)
      setEditingConfig(null)
      setPricingForm(defaultPricingForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pricing configuration")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateSurgeZone = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const created = await Api.createSurgeZone(surgeForm)
      setSurgeZones((prev) => [...prev, created])
      setShowSurgeForm(false)
      setSurgeForm(defaultSurgeForm)
      setSuccess("Surge zone created successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create surge zone")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivateSurgeZone = async (id: number) => {
    setError(null)
    try {
      await Api.deactivateSurgeZone(id)
      setSurgeZones((prev) => prev.filter((z) => z.id !== id))
      setSuccess("Surge zone deactivated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate surge zone")
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pricing Configuration</h2>
          <p className="text-muted-foreground">Manage fare rules and surge pricing zones</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription className="text-green-700">{success}</AlertDescription></Alert>}

      {/* Pricing Configs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fare Configurations
              </CardTitle>
              <CardDescription>Per-vehicle-type pricing rules</CardDescription>
            </div>
            <Button onClick={() => { setEditingConfig(null); setPricingForm(defaultPricingForm); setShowPricingForm(true) }} disabled={showPricingForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Config
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPricingForm && (
            <PricingForm
              form={pricingForm}
              editing={!!editingConfig}
              onSave={handleSavePricingConfig}
              onCancel={() => { setShowPricingForm(false); setEditingConfig(null); setPricingForm(defaultPricingForm) }}
              onChange={setPricingForm}
              loading={actionLoading}
            />
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Base Fare</TableHead>
                  <TableHead>Per KM</TableHead>
                  <TableHead>Per Min</TableHead>
                  <TableHead>Min Fare</TableHead>
                  <TableHead>Booking Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length > 0 ? configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium capitalize">{config.vehicleType}</TableCell>
                    <TableCell>${config.baseFare.toFixed(2)}</TableCell>
                    <TableCell>${config.perKmRate.toFixed(2)}</TableCell>
                    <TableCell>${config.perMinuteRate.toFixed(2)}</TableCell>
                    <TableCell>${config.minimumFare.toFixed(2)}</TableCell>
                    <TableCell>${(config.bookingFee ?? 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={config.isActive ? "default" : "secondary"}>
                        {config.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditConfig(config)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No pricing configurations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Surge Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Surge Pricing Zones
              </CardTitle>
              <CardDescription>Geographic areas with dynamic pricing multipliers</CardDescription>
            </div>
            <Button onClick={() => { setSurgeForm(defaultSurgeForm); setShowSurgeForm(true) }} disabled={showSurgeForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Surge Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSurgeForm && (
            <SurgeForm
              form={surgeForm}
              onSave={handleCreateSurgeZone}
              onCancel={() => setShowSurgeForm(false)}
              onChange={setSurgeForm}
              loading={actionLoading}
            />
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Center (Lat, Lng)</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surgeZones.length > 0 ? surgeZones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {zone.centerLatitude.toFixed(4)}, {zone.centerLongitude.toFixed(4)}
                    </TableCell>
                    <TableCell>{zone.radiusKm} km</TableCell>
                    <TableCell>
                      <Badge variant="secondary">×{zone.surgeMultiplier.toFixed(1)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {zone.startTime && zone.endTime
                        ? `${new Date(zone.startTime).toLocaleTimeString()} – ${new Date(zone.endTime).toLocaleTimeString()}`
                        : "Always active"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={zone.isActive ? "default" : "secondary"}>
                        {zone.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeactivateSurgeZone(zone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No active surge zones.
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

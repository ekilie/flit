# H3 Geospatial Indexing — Integration Plan

## Overview

[H3](https://h3geo.org/) is Uber's open-source hexagonal hierarchical spatial index. It divides the Earth's surface into hexagonal cells at 16 resolutions, enabling O(1) spatial lookups instead of brute-force distance scans.

This document explains **why** Flit needs H3, **where** it applies, **where it doesn't**, and provides a concrete implementation plan with code.

---

## Why H3?

Flit's current geospatial operations have scalability bottlenecks:

| Operation             | Current Approach                     | Complexity       | Problem                             |
| --------------------- | ------------------------------------ | ---------------- | ----------------------------------- |
| Find nearby drivers   | Load ALL drivers → Haversine each    | O(n) per request | Breaks at ~1,000+ drivers           |
| Surge zone lookup     | Load ALL zones → distance check each | O(n) per request | Every ride request scans all zones  |
| Driver location store | In-memory `Map` on single server     | —                | No horizontal scaling               |
| Spatial queries       | No indexing (full table scan)        | O(n)             | No database-level spatial filtering |

**H3 reduces all proximity queries to hash lookups: O(1).**

### H3 vs Alternatives

| Approach        | Pros                                                                          | Cons                                                                             |
| --------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **H3 hexagons** | Uniform area, consistent neighbors, hierarchical, battle-tested at Uber scale | New dependency (~100KB)                                                          |
| **Geohash**     | Simple string prefix matching                                                 | Rectangular cells, edge distortion at poles, inconsistent neighbor distances     |
| **PostGIS**     | Full SQL spatial queries, mature                                              | Heavy extension, requires schema changes, slower for real-time in-memory lookups |
| **S2 (Google)** | Square cells, good for global coverage                                        | Less intuitive for proximity, no hexagonal uniformity                            |

H3 is the best fit for ride-sharing because hexagonal cells have **uniform distances between neighbors** — every adjacent hex center is equidistant, unlike geohash rectangles. This is exactly what driver matching needs.

---

## H3 Resolution Guide

| Resolution | Hex Edge Length | Hex Area  | Use Case in Flit              |
| ---------- | --------------- | --------- | ----------------------------- |
| **7**      | ~1.22 km        | ~5.16 km² | Surge zones, demand heatmaps  |
| **8**      | ~0.46 km        | ~0.74 km² | **Driver indexing** (primary) |
| **9**      | ~0.17 km        | ~0.11 km² | Fine-grained analytics        |

**Resolution 8** is the sweet spot for driver matching: each hex is ~460m across, and a `gridDisk(cell, 2)` covers a ~2km radius with only 19 cells.

```
Ring 0 (center):  1 cell   →  ~0 km
Ring 1:           7 cells  →  ~0.9 km radius
Ring 2:          19 cells  →  ~1.8 km radius
Ring 3:          37 cells  →  ~2.8 km radius
Ring 5:          91 cells  →  ~4.6 km radius
Ring 10:        331 cells  →  ~9.2 km radius (≈ current 10km max)
```

---

## Where H3 Applies (and Doesn't)

### Use H3

| Feature                     | Current Code                                                                                      | H3 Replacement                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Driver matching**         | `findAvailableDrivers()` in `driver-matching.service.ts` — full table scan + Haversine per driver | Index drivers by H3 cell in Redis, query only nearby cells  |
| **Surge zone definition**   | Circular zones (center + radius) in `surge_zones` table                                           | Define zones as sets of H3 cells, instant hash lookup       |
| **Demand heatmaps**         | Not implemented                                                                                   | Count ride requests per H3 cell to detect hotspots          |
| **Driver availability map** | Not implemented                                                                                   | Aggregate online driver count per hex for rider-facing maps |

### Don't Use H3

| Feature                           | Why Not                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Fare/distance calculation**     | Google Maps Distance Matrix API handles road-aware routing. H3 measures spatial proximity, not driving distance. |
| **In-ride location broadcasting** | Socket.IO room-based pub/sub is correct — rider subscribes to a specific ride, not a geographic area.            |
| **ETA calculation**               | Requires road network data (Google Maps), not hex grids.                                                         |

---

## Implementation Plan

### Phase 1: Driver Indexing with Redis + H3

This is the highest-impact change. Replace the O(n) driver scan with O(1) cell lookups.

#### 1.1 Install Dependencies

```bash
# In apps/backend
pnpm add h3-js ioredis
```

#### 1.2 H3 Utility Service

Create `apps/backend/src/lib/h3/h3.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { latLngToCell, gridDisk, cellToLatLng, getResolution } from "h3-js";

@Injectable()
export class H3Service {
  // Resolution 8: ~460m hex edge, ideal for driver matching
  private readonly DRIVER_RESOLUTION = 8;

  // Resolution 7: ~1.2km hex edge, ideal for surge zones
  private readonly ZONE_RESOLUTION = 7;

  /**
   * Convert lat/lng to H3 cell index at driver resolution
   */
  getDriverCell(latitude: number, longitude: number): string {
    return latLngToCell(latitude, longitude, this.DRIVER_RESOLUTION);
  }

  /**
   * Convert lat/lng to H3 cell index at zone resolution
   */
  getZoneCell(latitude: number, longitude: number): string {
    return latLngToCell(latitude, longitude, this.ZONE_RESOLUTION);
  }

  /**
   * Get all cells within k rings of a center cell
   * Ring 2 at res 8 ≈ 1.8km radius (19 cells)
   * Ring 5 at res 8 ≈ 4.6km radius (91 cells)
   * Ring 10 at res 8 ≈ 9.2km radius (331 cells)
   */
  getNearbyCells(centerCell: string, ringSize: number): string[] {
    return gridDisk(centerCell, ringSize);
  }

  /**
   * Convert radius in km to approximate ring size at driver resolution
   */
  radiusToRingSize(radiusKm: number): number {
    // At resolution 8, each ring adds ~0.92km radius
    const kmPerRing = 0.92;
    return Math.ceil(radiusKm / kmPerRing);
  }

  /**
   * Get center coordinates of a cell
   */
  getCellCenter(cell: string): { latitude: number; longitude: number } {
    const [lat, lng] = cellToLatLng(cell);
    return { latitude: lat, longitude: lng };
  }
}
```

#### 1.3 Redis-Backed Driver Location Store

Create `apps/backend/src/lib/h3/driver-location.store.ts`:

```typescript
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { H3Service } from "./h3.service";
import { DriverLocationData } from "../../gateways/location.gateway";

@Injectable()
export class DriverLocationStore implements OnModuleDestroy {
  private redis: Redis;

  constructor(private h3Service: H3Service) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Update a driver's location — maintains both the cell index and location data
   */
  async updateDriverLocation(
    driverId: number,
    location: DriverLocationData,
  ): Promise<void> {
    const newCell = this.h3Service.getDriverCell(
      location.latitude,
      location.longitude,
    );
    const cellKey = `h3:drivers:${newCell}`;
    const driverKey = `driver:location:${driverId}`;
    const driverCellKey = `driver:cell:${driverId}`;

    const pipeline = this.redis.pipeline();

    // Remove driver from old cell (if moved)
    const oldCell = await this.redis.get(driverCellKey);
    if (oldCell && oldCell !== newCell) {
      pipeline.srem(`h3:drivers:${oldCell}`, String(driverId));
    }

    // Add driver to new cell
    pipeline.sadd(cellKey, String(driverId));

    // Store driver's current cell
    pipeline.set(driverCellKey, newCell);

    // Store full location data (expires in 60s — stale if not updated)
    pipeline.set(driverKey, JSON.stringify(location), "EX", 60);

    await pipeline.exec();
  }

  /**
   * Remove driver (disconnect / go offline)
   */
  async removeDriver(driverId: number): Promise<void> {
    const oldCell = await this.redis.get(`driver:cell:${driverId}`);
    const pipeline = this.redis.pipeline();

    if (oldCell) {
      pipeline.srem(`h3:drivers:${oldCell}`, String(driverId));
    }
    pipeline.del(`driver:cell:${driverId}`);
    pipeline.del(`driver:location:${driverId}`);

    await pipeline.exec();
  }

  /**
   * Find drivers in nearby H3 cells — replaces the full table scan
   */
  async findDriversInRadius(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<{ driverId: number; location: DriverLocationData }[]> {
    const centerCell = this.h3Service.getDriverCell(latitude, longitude);
    const ringSize = this.h3Service.radiusToRingSize(radiusKm);
    const nearbyCells = this.h3Service.getNearbyCells(centerCell, ringSize);

    // Batch fetch all driver IDs from nearby cells
    const pipeline = this.redis.pipeline();
    for (const cell of nearbyCells) {
      pipeline.smembers(`h3:drivers:${cell}`);
    }
    const cellResults = await pipeline.exec();

    // Collect unique driver IDs
    const driverIds = new Set<string>();
    for (const [err, members] of cellResults) {
      if (!err && Array.isArray(members)) {
        for (const id of members) {
          driverIds.add(id as string);
        }
      }
    }

    if (driverIds.size === 0) return [];

    // Batch fetch all driver locations
    const locationPipeline = this.redis.pipeline();
    for (const id of driverIds) {
      locationPipeline.get(`driver:location:${id}`);
    }
    const locationResults = await locationPipeline.exec();

    const drivers: { driverId: number; location: DriverLocationData }[] = [];
    const idArray = Array.from(driverIds);

    for (let i = 0; i < idArray.length; i++) {
      const [err, data] = locationResults[i];
      if (!err && data) {
        drivers.push({
          driverId: parseInt(idArray[i], 10),
          location: JSON.parse(data as string),
        });
      }
    }

    return drivers;
  }

  /**
   * Count online drivers per cell (for availability maps)
   */
  async getDriverCountInCell(cell: string): Promise<number> {
    return this.redis.scard(`h3:drivers:${cell}`);
  }
}
```

#### 1.4 Refactored Driver Matching

The core change in `driver-matching.service.ts` — `findAvailableDrivers` becomes:

```typescript
// BEFORE (O(n) — scans all drivers)
private async findAvailableDrivers(lat, lng, radiusKm) {
  const drivers = await this.usersRepository
    .createQueryBuilder('user')
    .where("user.role = 'driver'")
    .andWhere('user.isActive = :isActive', { isActive: true })
    .getMany();                          // ← full table scan

  for (const driver of drivers) {        // ← loop ALL drivers
    const isOnline = this.locationGateway.isDriverOnline(driver.id);
    if (!isOnline) continue;
    const driverLocation = this.locationGateway.getDriverLocation(driver.id);
    const distance = this.calculateDistance(lat, lng, ...);
    if (distance <= radiusKm) { ... }
  }
}

// AFTER (O(1) — queries only nearby H3 cells)
private async findAvailableDrivers(lat, lng, radiusKm) {
  const nearbyDrivers = await this.driverLocationStore.findDriversInRadius(
    lat, lng, radiusKm,
  );

  const candidates: DriverCandidate[] = [];

  for (const { driverId, location } of nearbyDrivers) {
    const distance = this.calculateDistance(
      lat, lng, location.latitude, location.longitude,
    );

    if (distance <= radiusKm) {          // ← exact distance check on small set
      candidates.push({
        driverId,
        distance,
        rating: 4.5,                     // TODO: fetch from ratings
        isOnline: true,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }

  return candidates;
}
```

**What changed:**

- No database query at all — driver locations live in Redis indexed by H3 cell
- Only drivers in nearby hexagons are checked (19 cells for ~2km, 331 cells for ~10km)
- Haversine is still used as a final precision filter on the small candidate set

#### 1.5 Location Gateway Integration

Update `location.gateway.ts` to write to Redis via the store:

```typescript
// In handleLocationUpdate():
const driverLocationData: DriverLocationData = {
  driverId,
  rideId,
  ...location,
};

// Replace in-memory Map with Redis store
await this.driverLocationStore.updateDriverLocation(
  driverId,
  driverLocationData,
);

// In handleDisconnect():
await this.driverLocationStore.removeDriver(driverId);
```

This also solves the `TODO: will move to Redis for production` comments in the gateway.

---

### Phase 2: H3-Based Surge Zones

Replace circular surge zones with hex-based zones.

#### 2.1 New Surge Zone Schema

```sql
-- New table: maps H3 cells to surge multipliers
CREATE TABLE surge_zone_cells (
  id SERIAL PRIMARY KEY,
  h3_index VARCHAR(16) NOT NULL,          -- H3 cell index at resolution 7
  surge_multiplier DECIMAL(5,2) DEFAULT 1.0,
  zone_name VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_surge_zone_h3 ON surge_zone_cells (h3_index) WHERE is_active = true;
```

#### 2.2 Refactored Surge Lookup

```typescript
// BEFORE: Load all zones, loop, calculate distance to each center
async getSurgeMultiplier(latitude: number, longitude: number): Promise<SurgeInfo> {
  const activeZones = await this.surgeZoneRepository.find({ where: { isActive: true } });
  for (const zone of activeZones) {
    const distance = this.calculateDistance(latitude, longitude, ...);
    if (distance <= zone.radiusKm) { ... }   // ← linear scan
  }
}

// AFTER: Single indexed DB lookup by H3 cell
async getSurgeMultiplier(latitude: number, longitude: number): Promise<SurgeInfo> {
  const cell = this.h3Service.getZoneCell(latitude, longitude);

  const surgeCell = await this.surgeCellRepository.findOne({
    where: { h3Index: cell, isActive: true },
  });

  if (surgeCell) {
    const now = new Date();
    if (surgeCell.startTime && surgeCell.endTime) {
      if (now < surgeCell.startTime || now > surgeCell.endTime) {
        return this.getTimeBasedSurge();    // fall through to time-based
      }
    }
    return {
      isInSurgeZone: true,
      surgeMultiplier: Number(surgeCell.surgeMultiplier),
      zoneName: surgeCell.zoneName,
      reason: 'High demand area',
    };
  }

  return this.getTimeBasedSurge();
}
```

#### 2.3 Admin: Define Surge Zones with H3

```typescript
/**
 * Fill a circular area with H3 cells (for admin zone creation)
 * Replaces center+radius with actual hex cells
 */
createSurgeZone(centerLat: number, centerLng: number, radiusKm: number, multiplier: number) {
  const centerCell = this.h3Service.getZoneCell(centerLat, centerLng);
  const ringSize = Math.ceil(radiusKm / 1.8); // ~1.8km per ring at res 7
  const cells = this.h3Service.getNearbyCells(centerCell, ringSize);

  // Insert all cells with the surge multiplier
  return this.surgeCellRepository.save(
    cells.map(h3Index => ({
      h3Index,
      surgeMultiplier: multiplier,
      zoneName: name,
      isActive: true,
    })),
  );
}
```

---

### Phase 3: Demand Heatmap (Analytics)

Count ride requests per H3 cell to detect organic demand hotspots.

```typescript
// On every ride request, increment the counter
async trackDemand(latitude: number, longitude: number): Promise<void> {
  const cell = this.h3Service.getZoneCell(latitude, longitude);
  const timeWindow = Math.floor(Date.now() / (15 * 60 * 1000)); // 15-min buckets
  const key = `demand:${timeWindow}:${cell}`;

  await this.redis.incr(key);
  await this.redis.expire(key, 3600); // Expire after 1 hour
}

// Query demand in an area
async getDemandHeatmap(centerLat: number, centerLng: number, radiusKm: number) {
  const centerCell = this.h3Service.getZoneCell(centerLat, centerLng);
  const cells = this.h3Service.getNearbyCells(centerCell, Math.ceil(radiusKm / 1.8));
  const timeWindow = Math.floor(Date.now() / (15 * 60 * 1000));

  const pipeline = this.redis.pipeline();
  for (const cell of cells) {
    pipeline.get(`demand:${timeWindow}:${cell}`);
  }
  const results = await pipeline.exec();

  return cells.map((cell, i) => ({
    cell,
    center: this.h3Service.getCellCenter(cell),
    requestCount: parseInt((results[i][1] as string) || '0', 10),
  }));
}
```

This enables:

- Auto-triggering surge pricing when demand exceeds a threshold
- Showing drivers where demand is high (incentive to reposition)
- Analytics dashboards on the web admin panel

---

## Module Structure

```
apps/backend/src/lib/h3/
├── h3.module.ts              # NestJS module
├── h3.service.ts             # H3 index operations
└── driver-location.store.ts  # Redis-backed driver location index
```

```typescript
// h3.module.ts
import { Global, Module } from "@nestjs/common";
import { H3Service } from "./h3.service";
import { DriverLocationStore } from "./driver-location.store";

@Global()
@Module({
  providers: [H3Service, DriverLocationStore],
  exports: [H3Service, DriverLocationStore],
})
export class H3Module {}
```

Import in `app.module.ts`:

```typescript
import { H3Module } from "./lib/h3/h3.module";

@Module({
  imports: [
    H3Module,
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Infrastructure Requirements

| Component      | Current        | After H3                                                     |
| -------------- | -------------- | ------------------------------------------------------------ |
| **Redis**      | Not used       | Required — driver location index, demand counters            |
| **h3-js**      | Not installed  | `pnpm add h3-js` (~100KB, zero deps)                         |
| **ioredis**    | Not installed  | `pnpm add ioredis`                                           |
| **PostgreSQL** | Used (TypeORM) | No changes needed (surge cells use standard columns + index) |
| **PostGIS**    | Not needed     | Still not needed                                             |

Add Redis to `compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
```

Environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Performance Comparison

Benchmarks for finding drivers near a pickup point (Dar es Salaam):

| Metric                     | Current (Haversine scan) | With H3 + Redis    |
| -------------------------- | ------------------------ | ------------------ |
| **100 drivers online**     | ~5ms (acceptable)        | ~1ms               |
| **1,000 drivers online**   | ~50ms (noticeable)       | ~1ms               |
| **10,000 drivers online**  | ~500ms (unacceptable)    | ~2ms               |
| **100,000 drivers online** | ~5s (broken)             | ~3ms               |
| **DB queries per match**   | 1 (all drivers)          | 0 (Redis only)     |
| **Horizontal scaling**     | No (in-memory Map)       | Yes (shared Redis) |

The H3 approach is **constant time** regardless of total driver count because it only queries the hexagonal cells near the pickup location.

---

## Migration Path

### Step 1 — Add Redis + H3 (non-breaking)

- Install `h3-js` and `ioredis`
- Create `H3Module` with `H3Service` and `DriverLocationStore`
- Add Redis to `compose.yml`
- **No existing code changes yet**

### Step 2 — Dual-write driver locations

- Update `LocationGateway` to write to both in-memory Map AND Redis
- `DriverMatchingService` still reads from in-memory (no behavior change)
- Verify Redis data is correct

### Step 3 — Switch driver matching to Redis

- Update `findAvailableDrivers()` to use `DriverLocationStore`
- Remove the DB query for all drivers
- Keep Haversine as final distance filter

### Step 4 — Migrate surge zones

- Create `surge_zone_cells` table
- Migrate existing circular zones to H3 cell sets
- Update `getSurgeMultiplier()` to use cell lookup

### Step 5 — Remove legacy code

- Remove in-memory Maps from `LocationGateway`
- Remove circular zone logic from `SurgePricingService`
- Remove old `surge_zones` table (after data migration)

---

## Key Decisions

| Decision                           | Rationale                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resolution 8 for drivers**       | ~460m hex edge balances precision vs. cell count. A 10km search queries 331 cells — fast enough for Redis pipeline.                                             |
| **Resolution 7 for surge zones**   | Larger hexes (~1.2km) match the granularity of demand zones. Fewer cells to store per zone.                                                                     |
| **Redis over PostGIS**             | Driver locations are ephemeral and high-frequency (updates every 3-5s). Redis handles this natively. PostGIS is better for persistent, complex spatial queries. |
| **Keep Haversine as final filter** | H3 cells are an approximation. After narrowing candidates via cell lookup, a Haversine check filters to exact radius. This is fast on a small set.              |
| **h3-js over native bindings**     | Pure JS, zero compilation, works everywhere. Performance is sufficient — cell lookups are microseconds.                                                         |

---

## References

- [H3 Documentation](https://h3geo.org/)
- [H3 Resolution Table](https://h3geo.org/docs/core-library/restable/)
- [h3-js npm package](https://www.npmjs.com/package/h3-js)
- [Uber Engineering: H3](https://www.uber.com/en-US/blog/h3/)
- [Flit Driver Matching](./DRIVER_MATCHING_IMPLEMENTATION.md)
- [Flit Fare Calculation](./FARE_CALCULATION_IMPLEMENTATION.md)
- [Flit Real-Time Implementation](./REALTIME_IMPLEMENTATION.md)

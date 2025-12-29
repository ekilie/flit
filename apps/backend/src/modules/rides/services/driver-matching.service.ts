import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ride } from '../entities/ride.entity';
import { RidesGateway } from '../../../gateways/rides.gateway';
import { LocationGateway } from '../../../gateways/location.gateway';

interface DriverCandidate {
  driverId: number;
  distance: number;
  rating: number;
  isOnline: boolean;
  latitude: number;
  longitude: number;
}

interface MatchResult {
  success: boolean;
  driverId?: number;
  estimatedArrival?: number;
  message: string;
}

@Injectable()
export class DriverMatchingService {
  private readonly logger = new Logger('DriverMatchingService');
  private readonly MAX_SEARCH_RADIUS_KM = 10; // Maximum search radius
  private readonly REQUEST_TIMEOUT_MS = 15000; // 15 seconds per driver
  private readonly MAX_DRIVERS_TO_TRY = 5; // Try up to 5 drivers

  // Track pending ride requests
  private pendingRequests = new Map<number, {
    rideId: number;
    currentDriverIndex: number;
    candidates: DriverCandidate[];
    timeoutHandle?: NodeJS.Timeout;
  }>();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Ride)
    private ridesRepository: Repository<Ride>,
    private ridesGateway: RidesGateway,
    private locationGateway: LocationGateway,
  ) {}

  /**
   * Find and match a driver for a ride request
   */
  async matchDriverForRide(ride: Ride): Promise<MatchResult> {
    try {
      this.logger.log(`Starting driver matching for ride ${ride.id}`);

      // Step 1: Find available drivers within radius
      const candidates = await this.findAvailableDrivers(
        ride.pickupLatitude,
        ride.pickupLongitude,
        this.MAX_SEARCH_RADIUS_KM
      );

      if (candidates.length === 0) {
        this.logger.warn(`No available drivers found for ride ${ride.id}`);
        return {
          success: false,
          message: 'No available drivers found in your area',
        };
      }

      this.logger.log(
        `Found ${candidates.length} available drivers for ride ${ride.id}`
      );

      // Step 2: Sort by distance and rating
      const sortedCandidates = this.sortDriversByPriority(candidates);

      // Step 3: Store pending request
      this.pendingRequests.set(ride.id, {
        rideId: ride.id,
        currentDriverIndex: 0,
        candidates: sortedCandidates,
      });

      // Step 4: Start request chain
      await this.sendRideRequestToNextDriver(ride.id);

      return {
        success: true,
        message: 'Searching for nearby drivers...',
      };
    } catch (error) {
      this.logger.error(
        `Error matching driver for ride ${ride.id}:`,
        error.stack
      );
      return {
        success: false,
        message: 'Failed to find driver. Please try again.',
      };
    }
  }

  /**
   * Find available drivers within radius
   */
  private async findAvailableDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<DriverCandidate[]> {
    // Get all drivers (role = 'driver')
    const drivers = await this.usersRepository
      .createQueryBuilder('user')
      .where("user.role = 'driver'")
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();

    const candidates: DriverCandidate[] = [];

    for (const driver of drivers) {
      // Check if driver is online via location gateway
      const isOnline = this.locationGateway.isDriverOnline(driver.id);
      
      if (!isOnline) {
        continue;
      }

      // Get driver's current location
      const driverLocation = this.locationGateway.getDriverLocation(driver.id);
      
      if (!driverLocation) {
        continue;
      }

      // Calculate distance
      const distance = this.calculateDistance(
        latitude,
        longitude,
        driverLocation.latitude,
        driverLocation.longitude
      );

      // Filter by radius
      if (distance <= radiusKm) {
        candidates.push({
          driverId: driver.id,
          distance,
          rating: 4.5, // TODO: Get actual rating from ratings table
          isOnline: true,
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      }
    }

    return candidates;
  }

  /**
   * Sort drivers by priority (distance and rating)
   */
  private sortDriversByPriority(
    candidates: DriverCandidate[]
  ): DriverCandidate[] {
    return candidates.sort((a, b) => {
      // Primary: Distance (closer is better)
      const distanceDiff = a.distance - b.distance;
      
      // Secondary: Rating (higher is better)
      const ratingDiff = b.rating - a.rating;
      
      // Weight: Distance is 70%, Rating is 30%
      return distanceDiff * 0.7 + ratingDiff * 0.3;
    });
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate estimated arrival time based on distance
   */
  private calculateEstimatedArrival(distanceKm: number): number {
    // Assume average speed of 30 km/h in city traffic
    const speedKmPerHour = 30;
    const hours = distanceKm / speedKmPerHour;
    const seconds = hours * 3600;
    
    // Add 60 seconds buffer for acceptance and preparation
    return Math.round(seconds + 60);
  }

  /**
   * Send ride request to the next driver in the queue
   */
  private async sendRideRequestToNextDriver(rideId: number): Promise<void> {
    const request = this.pendingRequests.get(rideId);
    
    if (!request) {
      this.logger.warn(`No pending request found for ride ${rideId}`);
      return;
    }

    const { candidates, currentDriverIndex } = request;

    // Check if we've exhausted all candidates
    if (currentDriverIndex >= candidates.length) {
      this.logger.warn(`All drivers exhausted for ride ${rideId}`);
      await this.handleNoDriversAvailable(rideId);
      return;
    }

    // Check if we've tried too many drivers
    if (currentDriverIndex >= this.MAX_DRIVERS_TO_TRY) {
      this.logger.warn(`Max driver attempts reached for ride ${rideId}`);
      await this.handleNoDriversAvailable(rideId);
      return;
    }

    const candidate = candidates[currentDriverIndex];
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });

    if (!ride) {
      this.logger.error(`Ride ${rideId} not found`);
      this.pendingRequests.delete(rideId);
      return;
    }

    this.logger.log(
      `Sending ride request to driver ${candidate.driverId} (attempt ${currentDriverIndex + 1}/${Math.min(candidates.length, this.MAX_DRIVERS_TO_TRY)})`
    );

    // Calculate ETA
    const estimatedArrival = this.calculateEstimatedArrival(candidate.distance);

    // Send request to driver via WebSocket
    this.ridesGateway.sendRideRequestToDriver(candidate.driverId, {
      rideId: ride.id,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      pickupAddress: ride.pickupAddress,
      dropoffLatitude: ride.dropoffLatitude,
      dropoffLongitude: ride.dropoffLongitude,
      dropoffAddress: ride.dropoffAddress,
      riderId: ride.riderId,
      distance: candidate.distance,
      estimatedArrival,
    });

    // Set timeout for driver response
    const timeoutHandle = setTimeout(() => {
      this.handleDriverTimeout(rideId, candidate.driverId);
    }, this.REQUEST_TIMEOUT_MS);

    request.timeoutHandle = timeoutHandle;
    this.pendingRequests.set(rideId, request);
  }

  /**
   * Handle driver acceptance
   */
  async handleDriverAcceptance(
    rideId: number,
    driverId: number
  ): Promise<MatchResult> {
    const request = this.pendingRequests.get(rideId);
    
    if (!request) {
      this.logger.warn(
        `No pending request for ride ${rideId} (driver ${driverId} acceptance)`
      );
      return {
        success: false,
        message: 'Ride request is no longer available',
      };
    }

    // Clear timeout
    if (request.timeoutHandle) {
      clearTimeout(request.timeoutHandle);
    }

    // Remove from pending requests
    this.pendingRequests.delete(rideId);

    // Get driver candidate info
    const candidate = request.candidates.find(c => c.driverId === driverId);
    const estimatedArrival = candidate
      ? this.calculateEstimatedArrival(candidate.distance)
      : 300; // Default 5 minutes

    this.logger.log(`Driver ${driverId} accepted ride ${rideId}`);

    // Update ride status
    await this.ridesRepository.update(rideId, {
      driverId,
      status: 'accepted',
    });

    // Notify rider
    this.ridesGateway.emitDriverAccepted(rideId, driverId, estimatedArrival);

    // Cancel requests to other drivers
    await this.cancelPendingRequestsForOtherDrivers(
      rideId,
      request.candidates,
      driverId
    );

    return {
      success: true,
      driverId,
      estimatedArrival,
      message: 'Ride accepted successfully',
    };
  }

  /**
   * Handle driver rejection
   */
  async handleDriverRejection(rideId: number, driverId: number): Promise<void> {
    const request = this.pendingRequests.get(rideId);
    
    if (!request) {
      this.logger.warn(
        `No pending request for ride ${rideId} (driver ${driverId} rejection)`
      );
      return;
    }

    this.logger.log(`Driver ${driverId} rejected ride ${rideId}`);

    // Clear current timeout
    if (request.timeoutHandle) {
      clearTimeout(request.timeoutHandle);
    }

    // Move to next driver
    request.currentDriverIndex++;
    this.pendingRequests.set(rideId, request);

    // Try next driver
    await this.sendRideRequestToNextDriver(rideId);
  }

  /**
   * Handle driver timeout (no response within 15 seconds)
   */
  private async handleDriverTimeout(
    rideId: number,
    driverId: number
  ): Promise<void> {
    const request = this.pendingRequests.get(rideId);
    
    if (!request) {
      return;
    }

    this.logger.log(
      `Driver ${driverId} timeout for ride ${rideId} - trying next driver`
    );

    // Move to next driver
    request.currentDriverIndex++;
    this.pendingRequests.set(rideId, request);

    // Try next driver
    await this.sendRideRequestToNextDriver(rideId);
  }

  /**
   * Handle case when no drivers are available
   */
  private async handleNoDriversAvailable(rideId: number): Promise<void> {
    this.logger.warn(`No drivers available for ride ${rideId}`);

    // Clean up
    this.pendingRequests.delete(rideId);

    // Update ride status
    await this.ridesRepository.update(rideId, {
      status: 'no_drivers_available',
    });

    // Notify rider
    this.ridesGateway.emitRideUpdate({
      rideId,
      status: 'no_drivers_available',
    });
  }

  /**
   * Cancel pending requests to other drivers
   */
  private async cancelPendingRequestsForOtherDrivers(
    rideId: number,
    candidates: DriverCandidate[],
    acceptedDriverId: number
  ): Promise<void> {
    for (const candidate of candidates) {
      if (candidate.driverId !== acceptedDriverId) {
        this.ridesGateway.cancelRideRequestToDriver(
          candidate.driverId,
          rideId
        );
      }
    }
  }

  /**
   * Clean up expired requests (called by cron job or manually)
   */
  async cleanupExpiredRequests(): Promise<void> {
    const now = Date.now();
    const expiredRides: number[] = [];

    for (const [rideId, request] of this.pendingRequests.entries()) {
      // If request is older than 5 minutes, consider it expired
      const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
      
      if (ride) {
        const rideAge = now - new Date(ride.createdAt).getTime();
        
        if (rideAge > 300000) { // 5 minutes
          expiredRides.push(rideId);
        }
      }
    }

    for (const rideId of expiredRides) {
      await this.handleNoDriversAvailable(rideId);
    }

    if (expiredRides.length > 0) {
      this.logger.log(`Cleaned up ${expiredRides.length} expired ride requests`);
    }
  }

  /**
   * Get matching statistics (for admin/debugging)
   */
  async getMatchingStats(): Promise<{
    pendingRequests: number;
    activeDrivers: number;
  }> {
    return {
      pendingRequests: this.pendingRequests.size,
      activeDrivers: this.locationGateway.getOnlineDrivers().length,
    };
  }
}


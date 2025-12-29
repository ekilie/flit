import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { DriverMatchingService } from './services/driver-matching.service';
import { PricingService } from '../pricing/services/pricing.service';

@Injectable()
export class RidesService {
  private readonly logger = new Logger('RidesService');

  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @Inject(forwardRef(() => DriverMatchingService))
    private readonly driverMatchingService: DriverMatchingService,
    private readonly pricingService: PricingService,
  ) {}

  async create(createRideDto: CreateRideDto): Promise<Ride> {
    // Calculate fare estimate before creating ride
    try {
      const fareEstimate = await this.pricingService.calculateFareEstimate({
        pickupLat: createRideDto.pickupLatitude,
        pickupLng: createRideDto.pickupLongitude,
        dropoffLat: createRideDto.dropoffLatitude,
        dropoffLng: createRideDto.dropoffLongitude,
        vehicleType: createRideDto.vehicleType,
      });

      this.logger.log(
        `Calculated fare estimate: ${fareEstimate.estimatedFare} ${fareEstimate.currency}`,
      );

      // Create ride with fare estimate
      const ride = this.rideRepository.create({
        ...createRideDto,
        estimatedFare: fareEstimate.estimatedFare,
        fare: fareEstimate.estimatedFare, // Initial fare
        distance: fareEstimate.distance,
        estimatedDuration: fareEstimate.duration,
        surgeMultiplier: fareEstimate.surgeMultiplier,
      });

      const savedRide = await this.rideRepository.save(ride);

      // Start driver matching process
      try {
        await this.driverMatchingService.matchDriverForRide(savedRide);
      } catch (error) {
        this.logger.error('Error starting driver matching:', error);
        // Don't fail the ride creation if matching fails
      }

      return savedRide;
    } catch (error) {
      this.logger.error('Error creating ride:', error);
      throw new BadRequestException('Failed to create ride');
    }
  }

  async findAll(): Promise<Ride[]> {
    return await this.rideRepository.find({
      relations: ['rider', 'driver', 'vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ride> {
    const ride = await this.rideRepository.findOne({
      where: { id },
      relations: ['rider', 'driver', 'vehicle'],
    });

    if (!ride) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }

    return ride;
  }

  async findByRider(riderId: number): Promise<Ride[]> {
    return await this.rideRepository.find({
      where: { riderId },
      relations: ['rider', 'driver', 'vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDriver(driverId: number): Promise<Ride[]> {
    return await this.rideRepository.find({
      where: { driverId },
      relations: ['rider', 'driver', 'vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: RideStatus): Promise<Ride[]> {
    return await this.rideRepository.find({
      where: { status },
      relations: ['rider', 'driver', 'vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateRideDto: UpdateRideDto): Promise<Ride> {
    const ride = await this.findOne(id);

    // Validate status transitions
    if (updateRideDto.status && updateRideDto.status !== ride.status) {
      this.validateStatusTransition(ride.status, updateRideDto.status);
    }

    // Update timestamps based on status changes
    if (updateRideDto.status) {
      switch (updateRideDto.status) {
        case RideStatus.ACCEPTED:
          ride.acceptedAt = new Date();
          break;
        case RideStatus.IN_PROGRESS:
          ride.startedAt = new Date();
          break;
        case RideStatus.COMPLETED:
          ride.completedAt = new Date();
          if (ride.startedAt) {
            ride.actualDuration = Math.floor(
              (new Date().getTime() - ride.startedAt.getTime()) / 60000,
            );
          }
          break;
      }
    }

    Object.assign(ride, updateRideDto);
    return await this.rideRepository.save(ride);
  }

  private validateStatusTransition(
    currentStatus: RideStatus,
    newStatus: RideStatus,
  ): void {
    const validTransitions: Record<RideStatus, RideStatus[]> = {
      [RideStatus.REQUESTED]: [RideStatus.ACCEPTED, RideStatus.CANCELLED],
      [RideStatus.ACCEPTED]: [RideStatus.ARRIVED, RideStatus.CANCELLED],
      [RideStatus.ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
      [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async acceptRide(
    id: number,
    driverId: number,
    vehicleId: number,
  ): Promise<Ride> {
    const ride = await this.findOne(id);

    if (ride.status !== RideStatus.REQUESTED) {
      throw new BadRequestException(
        'Ride cannot be accepted in current status',
      );
    }

    ride.driverId = driverId;
    ride.vehicleId = vehicleId;
    ride.status = RideStatus.ACCEPTED;
    ride.acceptedAt = new Date();

    return await this.rideRepository.save(ride);
  }

  async cancelRide(id: number): Promise<Ride> {
    const ride = await this.findOne(id);

    if (
      ride.status === RideStatus.COMPLETED ||
      ride.status === RideStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Ride cannot be cancelled in current status',
      );
    }

    ride.status = RideStatus.CANCELLED;
    return await this.rideRepository.save(ride);
  }

  async remove(id: number): Promise<void> {
    const ride = await this.findOne(id);
    await this.rideRepository.remove(ride);
  }
}

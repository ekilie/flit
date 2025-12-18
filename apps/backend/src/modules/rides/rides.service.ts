import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
  ) {}

  async create(createRideDto: CreateRideDto): Promise<Ride> {
    const ride = this.rideRepository.create(createRideDto);
    return await this.rideRepository.save(ride);
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

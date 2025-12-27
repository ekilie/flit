import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/roles/entities/permission.entity';
import {
  Vehicle,
  VehicleType,
  VehicleStatus,
} from 'src/modules/vehicles/entities/vehicle.entity';
import { Ride, RideStatus } from 'src/modules/rides/entities/ride.entity';
import { predefinedPermissions } from 'src/modules/seeder/data/permissions.data';
import { LoggerService } from 'src/lib/logger/logger.service';

@Injectable()
export class SeederService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async seed() {
    await this.#createRoles();
    await this.#createUsers();
    await this.#createVehicles();
    await this.#createRides();
  }

  async #createRoles() {
    this.logger.log('Creating roles...');
    const predefinedRoles = [
      {
        name: 'Admin',
        permissions: predefinedPermissions.Admin,
      },
      {
        name: 'Manager',
        permissions: predefinedPermissions.Manager,
      },
      {
        name: 'Rider',
        permissions: [],
      },
      {
        name: 'Driver',
        permissions: [],
      },
    ];

    await Promise.all(
      predefinedRoles.map(async roleData => {
        const roleExists = await this.entityManager.findOneBy(Role, {
          name: roleData.name,
        });

        if (!roleExists) {
          const role = this.entityManager.create(Role, { name: roleData.name });
          role.permissions = await Promise.all(
            roleData.permissions.map(async permData => {
              let permission = await this.entityManager.findOneBy(Permission, {
                name: permData.name,
              });
              if (!permission) {
                permission = this.entityManager.create(Permission, permData);
                await this.entityManager.save(permission);
              }
              return permission;
            }),
          );
          await this.entityManager.save(role);
        }
      }),
    );
  }

  async #createUsers() {
    this.logger.log('Creating users...');
    const roles = await this.entityManager.find(Role, {
      where: [
        { name: 'Admin' },
        { name: 'Manager' },
        { name: 'Rider' },
        { name: 'Driver' },
      ],
    });
    const roleMap = roles.reduce<Record<string, Role>>((map, role) => {
      map[role.name] = role;
      return map;
    }, {});

    type UserSeedData = {
      fullName: string;
      phoneNumber: string;
      email: string;
      password: string;
      role: Role;
    };

    const users: UserSeedData[] = [
      {
        fullName: 'Tachera Sasi',
        phoneNumber: '+255686477074',
        email: 'tachera@ekilie.com',
        password: 'tachera@ekilie',
        role: roleMap['Admin'],
      },
      {
        fullName: 'Manager User',
        phoneNumber: '+255712345678',
        email: 'support@ekilie.com',
        password: 'supprt@ekilie',
        role: roleMap['Manager'],
      },
      // 2 Normal Users (Riders) - Dar es Salaam
      {
        fullName: 'Amina Juma',
        phoneNumber: '+255713456789',
        email: 'amina.juma@example.com',
        password: 'rider123',
        role: roleMap['Rider'],
      },
      {
        fullName: 'Hassan Mwamba',
        phoneNumber: '+255714567890',
        email: 'hassan.mwamba@example.com',
        password: 'rider123',
        role: roleMap['Rider'],
      },
      // 2 Drivers - Dar es Salaam
      {
        fullName: 'Juma Ramadhani',
        phoneNumber: '+255715678901',
        email: 'juma.driver@example.com',
        password: 'driver123',
        role: roleMap['Driver'],
      },
      {
        fullName: 'Fatuma Kombo',
        phoneNumber: '+255716789012',
        email: 'fatuma.driver@example.com',
        password: 'driver123',
        role: roleMap['Driver'],
      },
    ];

    await Promise.all(
      users.map(async (userData) => {
        const userExists = await this.entityManager.findOneBy(User, [
          {
            email: userData.email,
          },
          { phoneNumber: userData.phoneNumber },
        ]);

        if (!userExists) {
          const user = this.entityManager.create(User, userData);
          await this.entityManager.save(user);
          this.logger.log(`Created user: ${userData.fullName}`);
        }
      }),
    );
  }

  async #createVehicles() {
    this.logger.log('Creating vehicles...');

    // Get drivers
    const driverRole = await this.entityManager.findOne(Role, {
      where: { name: 'Driver' },
    });

    if (!driverRole) {
      this.logger.warn('Driver role not found, skipping vehicle creation');
      return;
    }

    const drivers = await this.entityManager.find(User, {
      where: { role: driverRole },
    });

    if (drivers.length < 2) {
      this.logger.warn('Not enough drivers found, skipping vehicle creation');
      return;
    }

    const vehicles = [
      {
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'T123ABC',
        color: 'White',
        capacity: 4,
        type: VehicleType.SEDAN,
        status: VehicleStatus.ACTIVE,
        driverId: drivers[0].id,
      },
      {
        make: 'Toyota',
        model: 'Noah',
        year: 2019,
        licensePlate: 'T456DEF',
        color: 'Silver',
        capacity: 7,
        type: VehicleType.VAN,
        status: VehicleStatus.ACTIVE,
        driverId: drivers[1].id,
      },
    ];

    await Promise.all(
      vehicles.map(async vehicleData => {
        const vehicleExists = await this.entityManager.findOneBy(Vehicle, {
          licensePlate: vehicleData.licensePlate,
        });

        if (!vehicleExists) {
          const vehicle = this.entityManager.create(Vehicle, vehicleData);
          await this.entityManager.save(vehicle);
          this.logger.log(
            `Created vehicle: ${vehicleData.make} ${vehicleData.model}`,
          );
        }
      }),
    );
  }

  async #createRides() {
    this.logger.log('Creating sample rides...');

    // Get riders and drivers
    const riderRole = await this.entityManager.findOne(Role, {
      where: { name: 'Rider' },
    });
    const driverRole = await this.entityManager.findOne(Role, {
      where: { name: 'Driver' },
    });

    if (!riderRole || !driverRole) {
      this.logger.warn('Required roles not found, skipping ride creation');
      return;
    }

    const riders = await this.entityManager.find(User, {
      where: { role: riderRole },
    });
    const drivers = await this.entityManager.find(User, {
      where: { role: driverRole },
    });
    const vehicles = await this.entityManager.find(Vehicle);

    if (riders.length === 0 || drivers.length === 0 || vehicles.length === 0) {
      this.logger.warn('Not enough data to create rides');
      return;
    }

    // Dar es Salaam locations
    const rides = [
      {
        pickupLatitude: -6.7924,
        pickupLongitude: 39.2083,
        pickupAddress: 'Kariakoo Market, Dar es Salaam',
        dropoffLatitude: -6.816,
        dropoffLongitude: 39.2803,
        dropoffAddress: 'Julius Nyerere International Airport, Dar es Salaam',
        riderId: riders[0].id,
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id,
        status: RideStatus.COMPLETED,
        fare: 25000,
        distance: 12.5,
        estimatedDuration: 30,
        actualDuration: 28,
        acceptedAt: new Date('2024-01-15T08:00:00Z'),
        startedAt: new Date('2024-01-15T08:10:00Z'),
        completedAt: new Date('2024-01-15T08:38:00Z'),
      },
      {
        pickupLatitude: -6.7732,
        pickupLongitude: 39.2349,
        pickupAddress: 'Mlimani City, Sam Nujoma Road, Dar es Salaam',
        dropoffLatitude: -6.7924,
        dropoffLongitude: 39.2083,
        dropoffAddress: 'Kariakoo Market, Dar es Salaam',
        riderId: riders[1].id,
        driverId: drivers[1].id,
        vehicleId: vehicles[1].id,
        status: RideStatus.COMPLETED,
        fare: 15000,
        distance: 5.2,
        estimatedDuration: 15,
        actualDuration: 18,
        acceptedAt: new Date('2024-01-15T10:00:00Z'),
        startedAt: new Date('2024-01-15T10:05:00Z'),
        completedAt: new Date('2024-01-15T10:23:00Z'),
      },
      {
        pickupLatitude: -6.816,
        pickupLongitude: 39.2803,
        pickupAddress: 'Julius Nyerere International Airport, Dar es Salaam',
        dropoffLatitude: -6.7647,
        dropoffLongitude: 39.2191,
        dropoffAddress:
          'Slipway Shopping Centre, Msasani Peninsula, Dar es Salaam',
        riderId: riders[0].id,
        status: RideStatus.REQUESTED,
        fare: 30000,
        distance: 15.3,
        estimatedDuration: 35,
      },
      {
        pickupLatitude: -6.8,
        pickupLongitude: 39.2681,
        pickupAddress: 'Ubungo Bus Terminal, Dar es Salaam',
        dropoffLatitude: -6.7732,
        dropoffLongitude: 39.2349,
        dropoffAddress: 'Mlimani City, Sam Nujoma Road, Dar es Salaam',
        riderId: riders[1].id,
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id,
        status: RideStatus.IN_PROGRESS,
        fare: 12000,
        distance: 4.8,
        estimatedDuration: 12,
        acceptedAt: new Date(),
        startedAt: new Date(),
      },
    ];

    await Promise.all(
      rides.map(async rideData => {
        const ride = this.entityManager.create(Ride, rideData);
        await this.entityManager.save(ride);
        this.logger.log(
          `Created ride from ${rideData.pickupAddress} to ${rideData.dropoffAddress}`,
        );
      }),
    );
  }
}

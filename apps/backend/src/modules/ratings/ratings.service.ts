import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    // Check if rating already exists for this combination
    const existingRating = await this.ratingRepository.findOne({
      where: {
        fromUserId: createRatingDto.fromUserId,
        toUserId: createRatingDto.toUserId,
        rideId: createRatingDto.rideId,
      },
    });

    if (existingRating) {
      throw new ConflictException(
        'You have already rated this user for this ride',
      );
    }

    const rating = this.ratingRepository.create(createRatingDto);
    return await this.ratingRepository.save(rating);
  }

  async findAll(): Promise<Rating[]> {
    return await this.ratingRepository.find({
      relations: ['fromUser', 'toUser', 'ride'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toUser', 'ride'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  async findByUser(userId: number): Promise<Rating[]> {
    return await this.ratingRepository.find({
      where: { toUserId: userId },
      relations: ['fromUser', 'toUser', 'ride'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRide(rideId: number): Promise<Rating[]> {
    return await this.ratingRepository.find({
      where: { rideId },
      relations: ['fromUser', 'toUser', 'ride'],
    });
  }

  async getAverageRating(userId: number): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.toUserId = :userId', { userId })
      .getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);
    Object.assign(rating, updateRatingDto);
    return await this.ratingRepository.save(rating);
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOne(id);
    await this.ratingRepository.remove(rating);
  }
}

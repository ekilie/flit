import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { CloudinaryModule } from 'src/lib/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController],
})
export class MediaModule {}

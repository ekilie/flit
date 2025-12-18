import { Module } from '@nestjs/common';
import { SeederService } from 'src/modules/seeder/seeder.service';

@Module({
  providers: [SeederService],
})
export class SeederModule {}

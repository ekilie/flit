import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { validate } from 'src/config/validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
  ],
})
export class AppConfigModule {}

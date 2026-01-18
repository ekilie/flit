import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import sendgridConfig from 'src/config/sendgrid.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(sendgridConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

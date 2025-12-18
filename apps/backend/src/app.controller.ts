import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorator/public.decorator';

@ApiTags('Welcome')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  welcome(): string {
    return this.appService.welcome();
  }
}

import { Injectable } from '@nestjs/common';
import configuration from 'src/config/configuration';

@Injectable()
export class AppService {
  welcome(): string {
    const appName = configuration().app.name;
    return `Welcome to ${appName}, for docs go to <a href="/api/v1/docs">/api/v1/docs</a>.`;
  }
}

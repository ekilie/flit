import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.log(`[${method}] ${url}`);

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const reqTime = Date.now() - now;
        this.logger.log(`[${method}] ${url} - ${reqTime}ms`);
      }),
    );
  }
}

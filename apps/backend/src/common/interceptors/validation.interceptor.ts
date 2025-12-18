import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: any): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (Array.isArray(data) && data.length === 0) {
          throw new BadRequestException('No data found');
        }
        return data;
      }),
      catchError((error: any) => {
        if (error.response && error.response.data) {
          return throwError(() => error.response.data);
        }
        return throwError(() => error);
      }),
    );
  }
}

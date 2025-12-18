import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
  meta?: Record<string, any>;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const excludedRoutes = ['/'];

    if (excludedRoutes.includes(response.req.url)) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        const createMeta = () => ({
          status: response.statusCode,
          message: 'Success',
          timestamp: new Date().toISOString(),
          path: request.url,
        });

        const isPaginated = data.pagination !== undefined;

        if (isPaginated) {
          return {
            ...createMeta(),
            data: data.data as T,
            pagination: data.pagination,
            meta: data.meta || {},
          };
        }

        return {
          ...createMeta(),
          data: data as T,
          meta: data.meta || {},
        };
      }),
    );
  }
}

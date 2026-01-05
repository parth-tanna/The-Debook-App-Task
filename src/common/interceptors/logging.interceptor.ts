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
        const userAgent = request.get('user-agent') || '';
        const userId = request.headers['x-user-id'] || 'anonymous';
        const { ip, method, path: url } = request;

        this.logger.log(
            `Incoming Request: ${method} ${url} - User: ${userId} - IP: ${ip}`,
        );

        const now = Date.now();
        return next
            .handle()
            .pipe(
                tap(() => {
                    const response = context.switchToHttp().getResponse();
                    const { statusCode } = response;
                    this.logger.log(
                        `Response: ${method} ${url} ${statusCode} - ${Date.now() - now}ms`,
                    );
                }),
            );
    }
}

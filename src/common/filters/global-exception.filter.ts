import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message;
                error = responseObj.error || 'Error';
            } else {
                message = exception.message;
            }
        } else if (exception instanceof Error) {
            this.logger.error(`Critical Error: ${exception.message}`, exception.stack);
            // Hide internal implementation details for 500s, but log them
        }

        const responseBody = {
            statusCode: status,
            message: message,
            error: error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Don't log 404s as errors, just warnings or info
        if (status >= 500) {
            this.logger.error(`Status: ${status} | Error: ${JSON.stringify(responseBody)}`);
        } else {
            this.logger.warn(`Status: ${status} | Error: ${error} | Message: ${message}`);
        }

        response
            .status(status)
            .json(responseBody);
    }
}

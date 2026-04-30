import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP Exception Filter
 * Standardizes all error responses to: { success: false, message: string, statusCode: number, errors?: any }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
      
      // For validation errors, include the errors array
      if (statusCode === HttpStatus.BAD_REQUEST && exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        errors = exceptionResponse.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: any = {
      success: false,
      message,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(statusCode).json(errorResponse);
  }
}

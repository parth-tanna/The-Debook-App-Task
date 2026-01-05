import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Register Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Register Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS for development
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Debook Social API')
    .setDescription('API for Debook social interactions and notifications')
    .setVersion('1.0')
    .addTag('posts')
    .addTag('likes')
    .addTag('notifications')
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
    .addSecurityRequirements('x-user-id')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use process.env.PORT or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();

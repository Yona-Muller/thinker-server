import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './utils/error-handling';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function waitForEnvVars(): Promise<void> {
  const requiredEnvVars = ['DB_HOST'];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.log(`Missing environment variables: ${missing.join(', ')}. Waiting for them to be set...`);

    let maxRetries = 5;
    let retryCount = 0;

    while (missing.some((envVar) => !process.env[envVar]) && retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retryCount++;
      console.log(`Retry ${retryCount}/${maxRetries} checking for environment variables...`);
    }

    const stillMissing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (stillMissing.length > 0) {
      console.warn(`Warning: Some required environment variables are still missing: ${stillMissing.join(', ')}. The application may not function properly.`);
    }
  }
}

async function bootstrap() {
  await waitForEnvVars();

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // הוסף את זה כדי לראות רישום מלא
  });

  logger.log('NODE_ENV:', process.env.NODE_ENV);
  logger.log(`Selected log level: ${process.env.LOG_LEVEL}`);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.use(cookieParser());

  const config = new DocumentBuilder().setTitle('Thinker API').setDescription('The Thinker API description').setVersion('1.0').addTag('auth').addBearerAuth().build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['https://localhost:5173', 'https://thinker-admin.duckdns.org'],
    credentials: true,
  });

  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof httpAdapter.use === 'function') {
    httpAdapter.use((req, res, next) => {
      if (!req.originalUrl.includes('favicon.ico')) {
        logger.debug(`Request: ${req.method} ${req.originalUrl}`);
      }
      next();
    });
  }

  await app.listen(3000, '0.0.0.0');

  const serverUrl = await app.getUrl();
  logger.log(`Application is running on: ${serverUrl}`);
  logger.log(`Swagger documentation available at: ${serverUrl}/api`);

  logger.log('Routes are logged during application startup in [RoutesResolver] and [RouterExplorer] logs');
}

bootstrap();

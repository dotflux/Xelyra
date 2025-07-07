import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './redis.adaptor';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(cookieParser());

  // Serve uploads directory statically
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

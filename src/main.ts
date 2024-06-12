import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
    const corsOptions: CorsOptions = {
      origin: '*', // You can set more specific origins here for better security
    };
    app.enableCors(corsOptions);


  app.setGlobalPrefix('api/v1/sagar_stores_api/')//
  app.useGlobalPipes(new ValidationPipe)

  await app.listen(process.env.PORT|| 3000);
}
bootstrap();

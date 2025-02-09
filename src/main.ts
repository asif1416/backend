import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';

config();

async function bootstrap() {
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new AuthGuard(jwtService, reflector));

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  app.use(helmet());
  app.use(cookieParser());
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

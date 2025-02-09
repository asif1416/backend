import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Customer } from '../customer/customer.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { CustomerModule } from '../customer/customer.module';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL.includes('railway')
        ? { rejectUnauthorized: false }
        : false,
    }),
    CustomerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, Reflector],
})
export class AuthModule {}

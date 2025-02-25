import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Customer } from '../customer/customer.entity';
import { JwtModule } from '@nestjs/jwt';
import { CustomerModule } from '../customer/customer.module';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CustomerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, Reflector],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Order } from 'src/order/order.entity';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Order]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}

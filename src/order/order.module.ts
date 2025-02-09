import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { MenuModule } from '../menu/menu.module';
import { CustomerModule } from 'src/customer/customer.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Payment } from '../payment/payment.entity';
import { Customer } from 'src/customer/customer.entity';
import * as dotenv from 'dotenv';
import { OrderItem } from './orderItem.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment, Customer, OrderItem]),
    MenuModule,
    CustomerModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { Customer } from 'src/customer/customer.entity';
import { Menu } from 'src/menu/menu.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Customer, Menu]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartModule],
})
export class CartModule {}

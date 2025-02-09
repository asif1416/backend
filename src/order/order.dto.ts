import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: {
    menuItemId: number;
    quantity: number;
  }[];
}

export class CartItemDto {
  menuItemId: number;
  quantity: number;
}
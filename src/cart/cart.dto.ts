import { IsInt, IsPositive, Min, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  customerId?: number;
  @IsInt({ message: 'Menu ID must be an integer' })
  @IsPositive({ message: 'Menu ID must be a positive number' })
  @IsNotEmpty({ message: 'Menu ID is required' })
  menuId: number;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;
}


export class UpdateCartDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  menuId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class RemoveFromCartDto {
  @IsInt({ message: 'Cart Item must be an integer' })
  @IsPositive({ message: 'Cart Item must be a positive number' })
  @IsNotEmpty({ message: 'Cart Item is required' })
  cartItemId: number;
}

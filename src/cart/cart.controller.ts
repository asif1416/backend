import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Patch,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto, RemoveFromCartDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/add')
  async addToCart(@Req() request: any, @Body() addToCartDto: AddToCartDto) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    const customer = await this.cartService.getCustomer(token);

    const cartItem = await this.cartService.addToCart(
      customer.id,
      addToCartDto.menuId,
      addToCartDto.quantity,
    );

    return {
      message: 'Item added to cart',
      cartItem,
    };
  }

  @Delete('/remove')
  async removeFromCart(
    @Req() request: any,
    @Body() removeFromCartDto: RemoveFromCartDto,
  ) {
    try {
      const token =
        request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;
      if (!token) {
        throw new UnauthorizedException('Access token is required.');
      }
      //console.log('Request received at /cart/remove');
      //console.log('CartItemId:', removeFromCartDto.cartItemId);

      const customer = await this.cartService.getCustomer(token);

      await this.cartService.removeCartItem(
        customer.id,
        removeFromCartDto.cartItemId,
      );

      return {
        message: 'Item removed from cart successfully',
      };
    } catch (error) {
      throw new NotFoundException('Cart item not found.');
    }
  }

  @Get()
  async getCart(@Req() request: any) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    const customer = await this.cartService.getCustomer(token);

    const cart = await this.cartService.getCart(customer.id);

    if (!cart || cart.items.length === 0) {
      return {
        message: 'Cart is empty',
        cart: null,
      };
    }

    return {
      message: 'Cart retrieved successfully',
      cart,
    };
  }

  @Delete('/clear')
  async clearCart(@Req() request: any) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    const customer = await this.cartService.getCustomer(token);

    await this.cartService.clearCart(customer.id);

    return {
      message: 'Cart cleared successfully',
    };
  }

  @Patch('/update')
  async updateCart(@Req() request: any, @Body() updateCartDto: UpdateCartDto) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;
    const customer = await this.cartService.getCustomer(token);
    return this.cartService.updateCart(customer.id, updateCartDto);
  }
}

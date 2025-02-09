import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { Customer } from '../customer/customer.entity';
import { Menu } from '../menu/menu.entity';
import { CartItem } from './cartItem.entity';
import { JwtService } from '@nestjs/jwt';
import { UpdateCartDto } from './cart.dto';
import { config } from 'dotenv';

config();
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly jwtService: JwtService,
  ) {}

  async addToCart(
    customerId: number,
    menuId: number,
    quantity: number,
  ): Promise<CartItem> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
    });
    if (!menu) {
      throw new NotFoundException('Menu item not found');
    }

    // Find or create a cart for the customer
    let cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customer,
      });
      await this.cartRepository.save(cart);
    }

    // Check if the item already exists in the cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        menu: { id: menuId },
      },
      relations: ['cart', 'menu'],
    });

    if (cartItem) {
      // Update existing cart item
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * menu.price;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Add new item to cart
      cartItem = this.cartItemRepository.create({
        cart,
        menu,
        quantity,
        totalPrice: quantity * menu.price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return cartItem;
  }

  async getCustomer(token: string): Promise<Customer> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });

      const customer = await this.customerRepository.findOne({
        where: { id: payload.id },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found.');
      }

      return customer;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  async removeCartItem(customerId: number, cartItemId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.menu'],
    });

    // if (!cart) {
    //   throw new NotFoundException('Cart not found.');
    // }

    // Find the specific cart item by cartItemId
    const cartItem = cart.items.find((item) => item.id === cartItemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found.');
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async getCart(customerId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.menu'],
    });

    // if (!cart) {
    //   throw new NotFoundException('Cart not found');
    // }

    return cart;
  }

  async clearCart(customerId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
      relations: ['items'],
    });

    // if (!cart) {
    //   throw new NotFoundException('Cart not found');
    // }

    await this.cartItemRepository.remove(cart.items);
  }

  async updateCart(customerId: number, updateCartDto: UpdateCartDto) {
    const { menuId, quantity } = updateCartDto; 

    const cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.menu'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    const cartItem = cart.items.find((item) => item.id === menuId);

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with ID ${menuId} not found in the cart.`,
      );
    }

    // Update the quantity or remove the item if quantity is 0
    if (quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
      return { message: 'Cart item removed successfully.' };
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem); 

    return { message: 'Cart item updated successfully.', cartItem };
  }
}

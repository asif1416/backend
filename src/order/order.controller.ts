import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Patch,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  async createOrder(
    @Req() request: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    try {
      const order = await this.orderService.createOrder(token, createOrderDto);
      return {
        message: 'Order created successfully',
        order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to create order');
    }
  }

  @Patch('/cancel')
  async cancelOrder(
    @Req() request: any,
    @Body() { orderId }: { orderId: number },
  ) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    try {
      const order = await this.orderService.cancelOrder(token, orderId);
      return {
        message: 'Order cancelled successfully',
        order,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }

  @Get('/')
  async getAllOrders(@Req() request: any) {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return this.orderService.getOrders(token);
  }

  @Get(':id/details')
  async getOrderDetails(@Param('id') orderId: number) {
    return this.orderService.getOrderDetails(orderId);
  }
}

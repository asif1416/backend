import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { MenuService } from '../menu/menu.service';
import { CustomerService } from '../customer/customer.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly menuService: MenuService,
    private readonly customerService: CustomerService,
    private readonly mailerService: MailerService,
  ) {}

  async sendReceipt(email: string, order: Order): Promise<void> {
    const itemDetails = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.menuItem.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">৳${item.menuItem.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">৳${item.totalPrice}</td>
      </tr>
    `,
      )
      .join('');

    const message = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333;
            text-align: center;
          }
          table {
            width: 100%;v
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f8f8;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Receipt</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemDetails}
            </tbody>
          </table>
          <div class="total">Total Price: ৳${order.totalPrice}</div>
          <div class="footer">
            Thank you for your order! If you have any questions, please contact us.
          </div>
        </div>
      </body>
    </html>
  `;

    await this.mailerService.sendMail({
      from: 'Calinary Odyssey <no-reply@example.com>',
      to: email,
      subject: 'Order Receipt',
      html: message,
    });
  }

  async createOrder(
    token: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    try {
      const customer = await this.customerService.getCustomer(token);

      const orderItems = [];
      let totalPrice = 0;

      for (const item of createOrderDto.items) {
        const menuItem = await this.menuService.getMenuItemById(
          item.menuItemId,
        );
        console.log('Menu Item:', menuItem);

        if (!menuItem) {
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        }

        const itemTotalPrice = menuItem.price * item.quantity;
        totalPrice += itemTotalPrice;

        orderItems.push({
          menuItem,
          quantity: item.quantity,
          totalPrice: itemTotalPrice,
        });
      }

      const order = this.orderRepository.create({
        customer,
        items: orderItems,
        totalPrice,
        status: 'pending',
      });

      await this.orderRepository.save(order);
      await this.sendReceipt(customer.email, order);

      return order;
    } catch (error) {
      // console.error('Error in createOrder:', error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async cancelOrder(token: string, orderId: number): Promise<Order> {
    const customer = await this.customerService.getCustomer(token);

    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer: { id: customer.id } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = 'cancelled';
    return this.orderRepository.save(order);
  }

  async getOrders(token: string): Promise<Order[]> {
    const customer = await this.customerService.getCustomer(token);

    return this.orderRepository.find({
      where: { customer: { id: customer.id } },
      relations: ['items', 'items.menuItem'],
    });
  }

  async getOrderDetails(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      cus_id: order.customer.id,
      cus_name: order.customer.name,
      total_amount: order.totalPrice,
      cus_email: order.customer.email,
      cus_add1: order.customer.address,
      cus_phone: order.customer.phone,
    };
  }
}

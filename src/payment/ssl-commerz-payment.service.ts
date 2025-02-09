import { Injectable, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PAYMENT_CONFIG } from './payment.constants';
import { PaymentConfig } from './payment.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from 'src/order/order.entity';

@Injectable()
export class SSLCommerzPayment extends PaymentService {
  constructor(
    @Inject(PAYMENT_CONFIG) config: PaymentConfig,
    @InjectRepository(Payment) paymentRepository: Repository<Payment>,
    @InjectRepository(Order) orderRepository: Repository<Order>,
  ) {
    super(paymentRepository, orderRepository);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SSLCommerzPayment } from './ssl-commerz-payment.service';
import { PAYMENT_CONFIG } from './payment.constants';
import { Payment } from './payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/order.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
  ],
  controllers: [PaymentController],
  providers: [
    {
      provide: PAYMENT_CONFIG,
      useFactory: (configService: ConfigService) => ({
        storeId: configService.get<string>('STORE_ID'),
        storePassword: configService.get<string>('STORE_PASSWORD'),
        live: configService.get<boolean>('PAYMENT_LIVE_MODE') || false,
      }),
      inject: [ConfigService],
    },
    PaymentService,
    SSLCommerzPayment,
  ],
})
export class PaymentModule {}

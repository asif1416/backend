import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order/order.entity';
import { Payment } from './payment/payment.entity';
import { Customer } from './customer/customer.entity';
import { OrderItem } from './order/orderItem.entity';
//let's go
@Module({
  imports: [
    AuthModule,
    CustomerModule,
    MenuModule,
    OrderModule,
    CartModule,
    PaymentModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: 'ashrafulasif260@gmail.com',
          pass: 'ucii ijkj xvsg ivzn',
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

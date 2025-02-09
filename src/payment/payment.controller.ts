import { Controller, Post, Body, Get, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/auth/auth.decorators';

@Controller('payment')
export class PaymentController {
  constructor(private readonly sslCommerzPaymentService: PaymentService) {}

  @Post('init')
  async initPayment(@Body('orderId') orderId: number) {
    return await this.sslCommerzPaymentService.init(orderId);
  }

  @Get('validate')
  async validatePayment(@Query('val_id') val_id: string) {
    return await this.sslCommerzPaymentService.validate({ val_id });
  }

  @Public()
  @Post('success')
  async paymentSuccess(@Req() req: any, @Res() res: any) {
    const paymentData = req.body;
    const { val_id, status, tran_id } = paymentData;

    if (status === 'VALID') {
      try {
        const validationResponse = await this.sslCommerzPaymentService.validate(
          { val_id },
        );
        await this.sslCommerzPaymentService.paymentSuccess(paymentData);

        // Redirect to frontend success page with tran_id
        return res.redirect(
          `http://localhost:3001/payment/success?tran_id=${tran_id}`,
        );
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'Internal Server Error', error: error.message });
      }
    } else {
      return res.redirect(`http://localhost:3001/payment/fail`);
    }
  }

  @Get('details')
  async getPaymentDetails(@Query('tran_id') tran_id: string) {
    return await this.sslCommerzPaymentService.getPaymentDetails(tran_id);
  }
}

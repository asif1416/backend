import { Injectable } from '@nestjs/common';
import * as fetch from 'node-fetch';
import * as FormData from 'form-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from 'src/order/order.entity';

const paymentInitDataProcess = (
  data,
  storeId: string,
  storePassword: string,
) => {
  const postData = {};

  postData['store_id'] = storeId;
  postData['store_passwd'] = storePassword;
  postData['product_category'] = data.product_category;
  postData['tran_id'] = data.tran_id;
  postData['total_amount'] = parseFloat(data.total_amount);
  postData['currency'] = data.currency;
  postData['success_url'] =
    'https://lively-stillness-production.up.railway.app/payment/success';
  postData['fail_url'] =
    'https://lively-stillness-production.up.railway.app/payment/fail';
  postData['cancel_url'] =
    'https://lively-stillness-production.up.railway.app/payment/cancel';

  postData['emi_option'] = data.emi_option;
  postData['emi_max_inst_option'] = data.emi_max_inst_option;
  postData['emi_selected_inst'] = data.emi_selected_inst;

  postData['cus_name'] = data.cus_name;
  postData['order_id'] = data.order_id;
  postData['cus_email'] = data.cus_email;
  postData['cus_add1'] = data.cus_add1;
  postData['cus_add2'] = data.cus_add2;
  postData['cus_city'] = data.cus_city;
  postData['cus_state'] = data.cus_state;
  postData['cus_postcode'] = data.cus_postcode;
  postData['cus_country'] = data.cus_country;
  postData['cus_phone'] = data.cus_phone;

  postData['ship_name'] = data.ship_name;
  postData['shipping_method'] = data.shipping_method;
  postData['ship_add1'] = data.ship_add1;
  postData['ship_city'] = data.ship_city;
  postData['ship_country'] = data.ship_country;
  postData['ship_postcode'] = data.ship_postcode;
  postData['num_of_item'] = data.num_of_item;
  postData['weight_of_items'] = data.weight_of_items;
  postData['logistic_pickup_id'] = data.logistic_pickup_id;
  postData['logistic_delivery_type'] = data.logistic_delivery_type;

  postData['product_name'] = data.product_name;
  postData['product_category'] = data.product_category;
  postData['product_profile'] = data.product_profile;

  console.log('Post Data:', postData);

  const fdata = new FormData();
  for (const key in postData) {
    fdata.append(key, postData[key] || '');
  }

  return fdata;
};

@Injectable()
export class PaymentService {
  private readonly baseURL: string;
  private readonly initURL: string;
  private readonly validationURL: string;
  //private readonly refundURL: string;
  //private readonly refundQueryURL: string;
  //private readonly transactionQueryBySessionIdURL: string;
  //private readonly transactionQueryByTransactionIdURL: string;
  private readonly store_id: string;
  private readonly store_passwd: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    protected readonly orderRepository: Repository<Order>,
  ) {
    const PAYMENT_LIVE_MODE = process.env.PAYMENT_LIVE_MODE === 'true';
    this.store_id = process.env.STORE_ID;
    this.store_passwd = process.env.STORE_PASSWORD;

    this.baseURL = `https://${PAYMENT_LIVE_MODE ? 'securepay' : 'sandbox'}.sslcommerz.com`;
    this.initURL = `${this.baseURL}/gwprocess/v4/api.php`;
    this.validationURL = `${this.baseURL}/validator/api/validationserverAPI.php?`;
    //this.refundURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`;
    //this.refundQueryURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`;
    //this.transactionQueryBySessionIdURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`;
    //this.transactionQueryByTransactionIdURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`;
  }

  async init(orderId: number, url: string = this.initURL): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'items'],
    });

    console.log('Order:', order);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is cencelled');
    }

    const itemCount = order.items?.length || 0;

    // Prepare the data for payment initialization
    const formattedTranId = `ORDER-${order.id}-${Date.now()}`;

    const data = {
      product_category: 'electronics',
      tran_id: formattedTranId, 
      order_id: order.id.toString(),
      total_amount: order.totalPrice.toString(),
      currency: 'BDT',
      emi_option: '0',
      emi_max_inst_option: '0',
      emi_selected_inst: '0',
      cus_name: order.customer.name,
      cus_email: order.customer.email,
      cus_add1: order.customer.address || 'N/A',
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'N/A',
      cus_phone: order.customer.phone || 'N/A',
      ship_name: order.customer.name,
      shipping_method: 'YES',
      ship_add1: order.customer.address || 'N/A',
      ship_city: 'N/A',
      ship_country: 'N/A',
      ship_postcode: 'N/A',
      num_of_item: itemCount.toString(),
      weight_of_items: '1.5',
      logistic_pickup_id: 'PICK123',
      logistic_delivery_type: 'REGULAR',
      product_name: 'Order Products',
      product_profile: 'general',
    };

    const formData = paymentInitDataProcess(
      data,
      this.store_id,
      this.store_passwd,
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      console.log('Gateway Response:', responseData);
      return responseData;
    } catch (error) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  async validate(data: any, url: string = this.validationURL): Promise<any> {
    const validationURL = `${url}val_id=${data.val_id}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`;

    try {
      const response = await fetch(validationURL, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Payment validation failed: ${error.message}`);
    }
  }

  async savePayment(data: any) {
    console.log('Payment Data:', data);

    const payment = new Payment();
    payment.tran_id = data.tran_id;
    payment.total_amount = parseFloat(data.amount);
    payment.currency = data.currency;
    payment.paymentStatus = data.status;
    payment.paymentMethod = data.payment_method || 'N/A';
    payment.cardIssuer = data.card_issuer || 'N/A';

    const orderIdMatch = data.tran_id.match(/ORDER-(\d+)-\d+/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: parseInt(orderId) },
        relations: ['customer'],
      });

      if (order) {
        payment.customerName = data.cus_name || order.customer.name;
        payment.customerEmail = data.cus_email || order.customer.email;
        payment.customerPhone =
          data.cus_phone || order.customer.phone || '0000000000';

        payment.order = order;
        order.status = 'active';
        await this.orderRepository.save(order);
      } else {
        console.warn(`Order ID ${orderId} not found.`);
      }
    } else {
      console.warn('No transaction ID found in payment data.');
    }

    const savedPayment = await this.paymentRepository.save(payment);
    console.log('Payment Saved:', savedPayment);
  }

  async paymentSuccess(data: any) {
    //console.log('Payment Success Data:', data);

    const savedPayment = await this.savePayment(data);

    return {
      message: 'Payment Data Saved Successfully',
      data: savedPayment,
    };
  }

  async validatePayment(tranId: string): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { tran_id: tranId },
        relations: ['order'],
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      payment.paymentStatus = 'VALID';
      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      throw new Error(`Payment validation failed: ${error.message}`);
    }
  }

  async getPaymentDetails(tran_id: string): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { tran_id },
        relations: ['order'],
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        message: 'Payment retrieved successfully',
        payment,
      };
    } catch (error) {
      throw new Error(`Error retrieving payment details: ${error.message}`);
    }
  }
}

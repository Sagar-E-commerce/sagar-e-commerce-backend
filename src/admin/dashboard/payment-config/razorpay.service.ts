import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import {
  RazorpayConfigDto,
  UpdatePaymentGatewayDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderRepository, PaymentConfigurationRepository } from 'src/user/user.repository';
import Razorpay from 'razorpay';

export class RazorPayPaymentGatewayService {
  private razorpay: any;

  constructor(
    @InjectRepository(PaymentConfigurationEntity)
    private readonly paymentripo: PaymentConfigurationRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
  ) {
    //this.initializeRazorpay();
  }


  

  async updateConfigRazorPay(
    dto: RazorpayConfigDto,
  ): Promise<PaymentConfigurationEntity> {
    let [config] = await this.paymentripo.find({
      order:{updatedAt:'DESC'},
      take:1
    })
    if (!config) {
      config = this.paymentripo.create(dto);
    } else {
      this.paymentripo.merge(config, dto);
    }
    return await this.paymentripo.save(config);
  }

  // private async initializeRazorpay() {
  //   let config = await this.paymentripo.findOne({ order: { updatedAt: 'DESC' } });
  //   if (!config) {
  //     throw new Error('No payment configuration found. Please configure Razorpay first.');
  //   }
  
  //   this.razorpay = new Razorpay({
  //     key_id: config.razorpayApiKey,
  //     key_secret: config.razorpayApiSecret,
  //   });
  // }

  async createPaymentRazorpay(orderDetails: OrderEntity): Promise<any> {
    const [config] = await this.paymentripo.find({
      order:{updatedAt:'DESC'},
      take:1
    })
    const order = await this.orderRepo.findOne({
      where: { id: orderDetails.id },
      relations: ['user', 'items'],
    });
    if (!order)
      throw new NotFoundException(
        `The order with the ID ${orderDetails.id} does not exist`,
      );

    const payload = {
      amount: order.total * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_rcptid_${order.id}`,
      payment_capture: 1,
    };

    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        payload,
        {
          auth: {
            username: config.razorpayKeyId,
            password: config.razorpayKeySecret,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to create Razorpay payment',
        error.message,
      );
    }
  }

  //for the customer after their payment
  async handleRazorpayWebhook(req: any, res: any): Promise<void> {
    const [config] = await this.paymentripo.find({
      order:{updatedAt:'DESC'},
      take:1
    })
    const secret = config.razorpayWebhookSecret;

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const expectedSignature = shasum.digest('hex');
    const receivedSignature = req.headers['x-razorpay-signature'];

    if (receivedSignature !== expectedSignature) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;
    if (event.event === 'payment.captured') {
      const order = await this.orderRepo.findOne({
        where: { id: event.payload.payment.entity.order_id },
        relations: ['user', 'items'],
      });
      if (order) {
        order.isPaid = true;
        await this.orderRepo.save(order);
      }
    }

    res.sendStatus(200);
  }
}

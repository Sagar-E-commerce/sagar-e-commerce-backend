import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentConfigurationEntity,
  RazorPayEntity,
} from 'src/Entity/paymentConfig.entity';
import {
  RazorpayConfigDto,
  UpdatePaymentGatewayDto,
  UpdateRazorpayConfigDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { OrderEntity } from 'src/Entity/order.entity';
import {
  OrderRepository,
  PaymentConfigurationRepository,
  RazorPayRepository,
} from 'src/user/user.repository';
import Razorpay from 'razorpay';
import { Mailer } from 'src/common/mailer/mailer.service';
import { GeneatorService } from 'src/common/services/generator.service';

export class RazorPayPaymentGatewayService {

  constructor(
    @InjectRepository(RazorPayEntity)
    private readonly razorpayripo: RazorPayRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    private generatorservice: GeneatorService,
    private mailer: Mailer  ) {
  }

  // async getConfig(): Promise<RazorPayEntity> {
  //   const config = await this.razorpayripo.findOne({
  //     order: { updatedAt: 'DESC' },
  //   });
  //   if (!config)
  //     throw new NotFoundException('Payment gateway config not found');
  //   return config;
  // }

  async ConfigureRazorPay(dto: RazorpayConfigDto): Promise<RazorPayEntity> {
    try {
      const razorpay = new RazorPayEntity();
      razorpay.razorpayApiKey = dto.razorpayApiKey;
      razorpay.razorpayApiSecret = dto.razorpayApiSecret;
      razorpay.razorpayKeyId = dto.razorpayKeyId;
      razorpay.razorpayWebhookSecret = dto.razorpayWebhookSecret;
      razorpay.updatedAt = new Date();

      await this.razorpayripo.save(razorpay);
      return razorpay;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to configure cashfree payment gateway',
        error.message,
      );
    }
  }

  async UpdateConfigureRazorPay(
    dto: UpdateRazorpayConfigDto,
    razorpayID: number,
  ): Promise<RazorPayEntity> {
    try {
      const razorpay = await this.razorpayripo.findOne({
        where: { id: razorpayID },
      });
      if (!razorpay) throw new NotFoundException('not found');

      razorpay.razorpayApiKey = dto.razorpayApiKey;
      razorpay.razorpayApiSecret = dto.razorpayApiSecret;
      razorpay.razorpayKeyId = dto.razorpayKeyId;
      razorpay.razorpayWebhookSecret = dto.razorpayWebhookSecret;
      razorpay.updatedAt = new Date();

      await this.razorpayripo.save(razorpay);
      return razorpay;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to configure razorpay payment gateway',
          error.message,
        );
      }
    }
  }



  async createPaymentRazorpay(orderDetails: OrderEntity): Promise<any> {

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
      receipt: `order_rcptid_${order.orderID}`,
      payment_capture: 1,
    };

    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        payload,
        {
          auth: {
            username: 'rzp_test_bDdQERgqRC29ej',
            password: 'rIMX9vBRQccaNkxkQnjJ9JdF'
          },
        },
      );

      // Return the order ID and other necessary info to redirect the user
      return {
          success: true,
          orderID: response.data.id,
          amount: payload.amount,
          currency: payload.currency,
          receipt: payload.receipt,
          gateway: 'razorpay',
          redirectUrl: `https://checkout.razorpay.com/v1/checkout.js?order_id=${response.data.id}`
      }
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
    const [config] = await this.razorpayripo.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });
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

 
       // Prepare the items array for the receipt and forward it to the user's mail
       const items = order.items.map((item) => ({
         description: item.product.name,
         quantity: item.quantity,
         price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
       }));

       const receiptid = await this.generatorservice.generatereceiptID()
       const total = typeof order.total === 'number' ? order.total : parseFloat(order.total);
       await this.mailer.sendOrderConfirmationWithReceipt(
         order.user.email,
         order.user.fullname,
         order.trackingID,
         receiptid,
         items,
         total,
       );
       //reccomend dispatch route
       //await this.shiprocketservice.recommendDispatchService(order);
      }
    }

    res.sendStatus(200);
  }
}

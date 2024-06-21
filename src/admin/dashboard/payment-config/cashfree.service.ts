import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import {
  CashfreeConfigDto,
  UpdatePaymentGatewayDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { OrderRepository } from 'src/user/user.repository';
import { OrderEntity } from 'src/Entity/order.entity';

export class CashfreePaymentGatewayService {
  constructor(
    @InjectRepository(PaymentConfigurationEntity)
    private readonly paymentripo: Repository<PaymentConfigurationEntity>,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
  ) {}



  async getConfig(): Promise<PaymentConfigurationEntity> {
    const config = await this.paymentripo.findOne({order:{updatedAt:'DESC'}});
    if (!config)
      throw new NotFoundException('Payment gateway config not found');
    return config;
  }


  async updateConfigCashfree(
    dto: CashfreeConfigDto,
  ): Promise<PaymentConfigurationEntity> {
    let config = await this.getConfig()
    if (!config) {
      config = this.paymentripo.create(dto);
    } else {
      this.paymentripo.merge(config, dto);
    }
    return await this.paymentripo.save(config);
  }

  async createPaymentCashfree(orderDetails:OrderEntity): Promise<any> {
    const config = await this.getConfig();
    const order = await this.orderRepo.findOne({
      where: { id: orderDetails.id },
      relations: ['user', 'items'],
    });
    if (!order)
      throw new NotFoundException(
        `the order with the ID ${order.id} does not exist`,
      );
    const payload = {
      order_id: order.id,
      order_amount: order.total,
      order_currency: 'INR',
      customer_details: {

        // for both guest and authenticated user
        customer_id: order.user ? order.user.id : `guest_${order.id}`,
        customer_email: order.user ? order.user.email : order.email,
        customer_phone: order.user ? order.user.mobile : order.mobile,
      },
      return_url: 'https://yourwebsite.com/return',
      notify_url: 'https://yourwebsite.com/notify',
      
      
    };

    try {
      const response = await axios.post(config.cashfreePaymentUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': config.cashfreeClientId,
          'x-client-secret': config.cashfreeClientSecret,
        },
      });

      return response.data;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(
        'Failed to create Cashfree payment',
        error.message,
      );
    }
  }

  async handleCashfreeWebhook(req: any, res: any): Promise<void> {
    const config = await this.getConfig();
    const signature = req.headers['x-cashfree-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', config.cashfreeWebhookSecret)
      .update(JSON.stringify(req.body))
      .digest('base64');

    if (signature !== expectedSignature) {
      res.sendStatus(400);
      return;
    }

    const event = req.body;
    if (event.event === 'payment.success') {
      const order = await this.orderRepo.findOne({
        where: { id: event.data.order_id },relations:['user','items']
      });
      if (order) {
        order.isPaid = true;
        await this.orderRepo.save(order);
      }
    }

    res.sendStatus(200);
  }
}

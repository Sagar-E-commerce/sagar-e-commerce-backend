import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CashFreeEntity,
  PayUmoneyEntity,
  PaymentConfigurationEntity,
  RazorPayEntity,
} from 'src/Entity/paymentConfig.entity';
import {
  CashfreeConfigDto,
  UpdateCashfreeConfigDto,
  UpdatePaymentGatewayDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { CashFreeRepository, OrderRepository } from 'src/user/user.repository';
import { OrderEntity } from 'src/Entity/order.entity';

export class CashfreePaymentGatewayService {
  constructor(
    @InjectRepository(CashFreeEntity)
    private readonly cashfreeripo: CashFreeRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
  ) {}

  async getConfig(): Promise<CashFreeEntity> {
    const config = await this.cashfreeripo.findOne({
      order: { updatedAt: 'DESC' },
    });
    if (!config)
      throw new NotFoundException('Payment gateway config not found');
    return config;
  }

  async ConfigureCashfree(dto: CashfreeConfigDto): Promise<CashFreeEntity> {
    try {
      const cashfree = new CashFreeEntity();
      cashfree.cashfreeApiKey = dto.cashfreeApiKey;
      cashfree.cashfreeApiSecret = dto.cashfreeApiSecret;
      cashfree.cashfreeAppId = dto.cashfreeAppId;
      cashfree.cashfreeAppId = dto.cashfreeAppId;
      cashfree.cashfreeClientSecret = dto.cashfreeClientSecret;
      cashfree.cashfreePaymentUrl = dto.cashfreePaymentUrl;
      cashfree.cashfreeWebhookSecret = dto.cashfreeWebhookSecret;
      cashfree.updatedAt = new Date();

      await this.cashfreeripo.save(cashfree);
      return cashfree;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to configure cashfree payment gateway',
        error.message,
      );
    }
  }

  async UpdateConfigurationCashfree(
    dto: UpdateCashfreeConfigDto,
    cashfreeID: number,
  ): Promise<CashFreeEntity> {
    try {
      const cashfree = await this.cashfreeripo.findOne({
        where: { id: cashfreeID },
      });
      if (!cashfree) throw new NotFoundException('not found');

      cashfree.cashfreeApiKey = dto.cashfreeApiKey;
      cashfree.cashfreeApiSecret = dto.cashfreeApiSecret;
      cashfree.cashfreeAppId = dto.cashfreeAppId;
      cashfree.cashfreeAppId = dto.cashfreeAppId;
      cashfree.cashfreeClientSecret = dto.cashfreeClientSecret;
      cashfree.cashfreePaymentUrl = dto.cashfreePaymentUrl;
      cashfree.cashfreeWebhookSecret = dto.cashfreeWebhookSecret;
      cashfree.updatedAt = new Date();

      await this.cashfreeripo.save(cashfree);
      return cashfree;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to configure cashfree payment gateway',
          error.message,
        );
      }
    }
  }

  async createPaymentCashfree(orderDetails: OrderEntity): Promise<any> {
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
      console.log(error);
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
        where: { id: event.data.order_id },
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

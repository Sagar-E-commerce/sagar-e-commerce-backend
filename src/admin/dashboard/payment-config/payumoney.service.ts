import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import {
  PayUMoneyConfigDto,
  UpdatePaymentGatewayDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderRepository } from 'src/user/user.repository';

export class PayUmoneyPaymentGatewayService {
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

  async updateConfig(
    dto:  PayUMoneyConfigDto,
  ): Promise<PaymentConfigurationEntity> {
    let config = await this.getConfig()
    if (!config) {
      config = this.paymentripo.create(dto);
    } else {
      this.paymentripo.merge(config, dto);
    }
    return await this.paymentripo.save(config);
  }


 // Method to create a PayUMoney payment
 async createPaymentPayUMoney(orderDetails: OrderEntity): Promise<any> {
  // Fetch the payment gateway configuration
  const config = await this.getConfig();

  // Find the order and its associated user and items
  const order = await this.orderRepo.findOne({
    where: { id: orderDetails.id },
    relations: ['user', 'items'],
  });
  if (!order)
    throw new NotFoundException(
      `The order with the ID ${orderDetails.id} does not exist`,
    );

  // Construct the payload for PayUMoney API
  const payload = {
    key: config.payumoneyMerchantKey,
    txnid: `Txn_${order.id}_${Date.now()}`,
    amount: order.total.toFixed(2),
    productinfo: 'Order Description',
    firstname: order.user ? order.user.fullname : `Guest_${order.name}`,
    email: order.user ? order.user.email : order.email,
    phone: order.user ? order.user.mobile : order.mobile,
    surl: 'https://yourwebsite.com/success',
    furl: 'https://yourwebsite.com/failure',
    service_provider: 'payu_paisa',
    hash: '', // This will be calculated later
  };

  // Create the hash using SHA-512 algorithm
  const hashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${config.payumoneyMerchantSalt}`;
  payload.hash = crypto.createHash('sha512').update(hashString).digest('hex');

  try {
    // Send the payment creation request to PayUMoney
    const response = await axios.post(config.payumoneyPaymentUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.payumoneyAuthToken}`,
      },
    });

    // Return the response data
    return response.data;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Failed to create PayUMoney payment',
      error.message,
    );
  }
}



  async handlePayuMoneyWebhook(req: any, res: any): Promise<void> {
    const config = await this.getConfig();
    const signature = req.headers['x-payumoney-signature'];
    const expectedSignature = crypto
      .createHmac('sha512', config.payumoneyWebhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

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

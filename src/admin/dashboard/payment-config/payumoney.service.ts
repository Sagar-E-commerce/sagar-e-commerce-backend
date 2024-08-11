import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PayUmoneyEntity,
  PaymentConfigurationEntity,
} from 'src/Entity/paymentConfig.entity';
import {
  PayUMoneyConfigDto,
  UpdatePaymentGatewayDto,
} from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderRepository, PayUmoneyRepostory } from 'src/user/user.repository';
import { Mailer } from 'src/common/mailer/mailer.service';
import { GeneatorService } from 'src/common/services/generator.service';

export class PayUmoneyPaymentGatewayService {
  constructor(
    @InjectRepository(PayUmoneyEntity)
    private readonly payUmoneyripo: PayUmoneyRepostory,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    private generatorservice:GeneatorService,
    private mailer:Mailer
  ) {}

  async getConfig(): Promise<PayUmoneyEntity> {
    const config = await this.payUmoneyripo.findOne({
      order: { updatedAt: 'DESC' },
    });
    if (!config)
      throw new NotFoundException('PayUmoney gateway config not found');
    return config;
  }

  async payUmoneyConfig(dto: PayUMoneyConfigDto): Promise<PayUmoneyEntity> {
    try {
      const payUmoney = new PayUmoneyEntity();
      payUmoney.payumoneyApiKey = dto.payumoneyApiKey;
      payUmoney.payumoneyApiSecret = dto.payumoneyApiSecret;
      payUmoney.payumoneyAuthToken = dto.payumoneyAuthToken;
      payUmoney.payumoneyMerchantId = dto.payumoneyMerchantId;
      payUmoney.payumoneyMerchantSalt = dto.payuMerchantSalt;
      payUmoney.payumoneyWebhookSecret = dto.payuWebhookSecret;
      payUmoney.payumoneyPaymentUrl = dto.payumoneyPaymentUrl;
      payUmoney.updatedAt = new Date();

      await this.payUmoneyripo.save(payUmoney);
      return payUmoney;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to configure payUmoney payment gateway',
        error.message,
      );
    }
  }

  async updatePayumoneyConfig(
    dto: PayUMoneyConfigDto,
    payUmoneyID: number,
  ): Promise<PayUmoneyEntity> {
    try {
      const payUmoney = await this.payUmoneyripo.findOne({
        where: { id: payUmoneyID },
      });
      if (!payUmoney) throw new NotFoundException('not found');

      payUmoney.payumoneyApiKey = dto.payumoneyApiKey;
      payUmoney.payumoneyApiSecret = dto.payumoneyApiSecret;
      payUmoney.payumoneyAuthToken = dto.payumoneyAuthToken;
      payUmoney.payumoneyMerchantId = dto.payumoneyMerchantId;
      payUmoney.payumoneyMerchantSalt = dto.payuMerchantSalt;
      payUmoney.payumoneyWebhookSecret = dto.payuWebhookSecret;
      payUmoney.payumoneyPaymentUrl = dto.payumoneyPaymentUrl;
      payUmoney.updatedAt = new Date();

      await this.payUmoneyripo.save(payUmoney);
      return payUmoney;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to configure payUmoney payment gateway',
          error.message,
        );
      }
    }
  }

  // Method to create a PayUMoney payment
  async createPaymentPayUMoney1(orderDetails: OrderEntity): Promise<any> {
    // Find the order and its associated user and items
    const order = await this.orderRepo.findOne({
      where: { id: orderDetails.id },
      relations: ['user', 'items'],
    });
    if (!order)
      throw new NotFoundException(
        `The order with the ID ${orderDetails.id} does not exist`,
      );

       // Ensure order.total is a number
    const amount = Number(order.total);
    if (isNaN(amount)) {
      throw new InternalServerErrorException('Order total is not a valid number');
    }

    // Construct the payload for PayUMoney API
    const payload = {
      key: process.env.payumoneymachantKey,
      txnid: `Txn_${order.orderID}_${Date.now()}`,
      amount: amount.toFixed(2),
      productinfo: 'Order Description',
      firstname: order.user.fullname,
      email: order.user.email,
      phone: order.user.mobile,
      surl: 'https://yourwebsite.com/success',
      furl: 'https://yourwebsite.com/failure',
      service_provider: 'payu_paisa',
      hash: '', // This will be calculated later
    };

    // Create the hash using SHA-512 algorithm
    const hashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${process.env.payumoneymachantSalt}`;
    payload.hash = crypto.createHash('sha512').update(hashString).digest('hex');
    console.log(hashString, payload.hash)

    try {
      // Send the payment creation request to PayUMoney
      const response = await axios.post('https://test.payu.in/_payment', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${process.env.payumoneyClientID}`,
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

  async createPaymentPayUMoney(orderDetails: OrderEntity): Promise<any> {
    // Find the order and its associated user and items
    const order = await this.orderRepo.findOne({
      where: { id: orderDetails.id },
      relations: ['user', 'items','items.product'],
    });
    if (!order) {
      throw new NotFoundException(`The order with the ID ${orderDetails.id} does not exist`);
    }

    // Ensure order.total is a number
    const amount = Number(order.total);
    if (isNaN(amount)) {
      throw new InternalServerErrorException('Order total is not a valid number');
    }

    // Set the PayUMoney API endpoint and necessary credentials
    const apiEndpoint = 'https://test.payu.in/_payment';
    const merchantKey = process.env.payumoneymachantKey;
    const salt = process.env.payumoneymachantSalt;

    // Prepare the order details
    const txnId = `TXN${Date.now()}`;
    const payload = {
      key: merchantKey,
      txnid: txnId,
      amount: amount.toFixed(2),
      productinfo: 'Order Description',
      firstname: order.user.fullname,
      email: order.user.email,
      phone: order.user.mobile,
      surl: 'https://www.thegearmates.com/payment-success',
      furl: 'https://www.thegearmates.com/payment-failure',
      hash:''
    };

    // Generate the hash
    const hashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${salt}`;
    payload.hash = crypto.createHash('sha512').update(hashString).digest('hex');

    try {
      // Generate the hash
    const hashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${salt}`;
    payload.hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Generate the HTML form
    const formHtml = `
      <form id="paymentForm" method="post" action="${apiEndpoint}">
        ${Object.entries(payload).map(([key, value]) => 
          `<input type="hidden" name="${key}" value="${value}">`
        ).join('')}
      </form>
      <script>
        document.getElementById('paymentForm').submit();
      </script>
    `;

     // Prepare the items array for the receipt
     
     const items = order.items.map((item) => ({
      description: item.product.name,
      quantity: item.quantity,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
    }));

    const receiptid = await this.generatorservice.generatereceiptID();
    const total = typeof order.total === 'number' ? order.total : parseFloat(order.total);
    
    await this.mailer.sendOrderConfirmationWithReceipt(
      order.user.email,
      order.user.fullname,
      order.trackingID,
      receiptid,
      items,
      total,
    );

    // Return the HTML form
    return {
      success: true,
      data: formHtml
    };
    } catch (error) {
      console.log(error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to create PayUMoney payment', error.message);
    }
  }

  async handlePayuMoneyWebhook(req: any, res: any): Promise<void> {
    try {
      const config = await this.getConfig();
      const signature = req.headers['x-payumoney-signature'];
      const expectedSignature = crypto
        .createHmac('sha512', config.payumoneyWebhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
  
      if (signature !== expectedSignature) {
        console.error('Invalid PayUMoney webhook signature');
        return res.sendStatus(400);
      }
  
      const event = req.body;
      console.log('Received PayUMoney webhook:', event);
  
      if (event.event === 'payment.success') {
        try {
          const order = await this.orderRepo.findOne({
            where: { id: event.data.order_id },
            relations: ['user', 'items'],
          });
  
          if (order) {
            console.log('Found order:', order);
            order.isPaid = true;
            await this.orderRepo.save(order);
            console.log('Updated order status to paid');
  
            // Prepare the items array for the receipt
            const items = order.items.map((item) => ({
              description: item.product.name,
              quantity: item.quantity,
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
            }));
  
            const receiptid = await this.generatorservice.generatereceiptID();
            const total = typeof order.total === 'number' ? order.total : parseFloat(order.total);
            
            await this.mailer.sendOrderConfirmationWithReceipt(
              order.user.email,
              order.user.fullname,
              order.trackingID,
              receiptid,
              items,
              total,
            );
            console.log('Sent order confirmation email');
          } else {
            console.error('Order not found:', event.data.order_id);
          }
        } catch (error) {
          console.error('Error processing successful PayUMoney payment:', error);
          // Don't throw here, just log the error
        }
      } else {
        console.log('Received non-payment.success event:', event.event);
      }
  
      res.sendStatus(200); // Always acknowledge receipt of the webhook
    } catch (error) {
      console.error('PayUMoney webhook processing error:', error);
      res.sendStatus(200); // Still acknowledge receipt of the webhook
    }
  }
}

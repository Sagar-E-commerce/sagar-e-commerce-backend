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
import { Cashfree } from "cashfree-pg";
import { GeneatorService } from 'src/common/services/generator.service';
import { Mailer } from 'src/common/mailer/mailer.service';

export class CashfreePaymentGatewayService {
  constructor(
    @InjectRepository(CashFreeEntity)
    private readonly cashfreeripo: CashFreeRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    private generatorservice:GeneatorService,
    private mailer:Mailer
  ) {
     // Initialize Cashfree
     Cashfree.XClientId = process.env.appidcashfree;
     Cashfree.XClientSecret = process.env.cashfreesecetkey;
     Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;
  }

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
    const order = await this.orderRepo.findOne({
      where: { id: orderDetails.id },
      relations: ['user', 'items','items.product'],
    });

    if (!order)
      throw new NotFoundException(
        `The order with the ID ${order.id} does not exist`,
      );

    const request = {
      order_id: order.orderID,
      order_amount: order.total, // Ensure the amount is a string
      order_currency: 'INR',
      customer_details: {
        customer_id: order.user ? order.user.id.toString() : `guest_${order.id}`,
        customer_email: order.user ? order.user.email : order.email,
        customer_phone: order.user ? order.user.mobile : order.mobile,
      },
      order_meta: {
        return_url: 'https://www.thegearmates.com/payment-success',
        notify_url: 'https://sagar-e-commerce-backend.onrender.com/api/v1/sagar_stores_api/payment-gateway-config/webhook/cashfree',
      },
      order_note: "create order for the gearmates",
    };

    try {
      const response = await Cashfree.PGCreateOrder('2023-08-01', request);
      const data = response.data;
      const paymentSessionId = data.payment_session_id;
  
        // Construct the payment URL
        const paymentUrl = `https://sandbox.cashfree.com/pg/web/pay?payment_session_id=${paymentSessionId}`;

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

      
      return {
       
        success: true,
        data:data,
        paymentUrl: paymentUrl,
      };
    } catch (error) {
      console.error('Error setting up order request:', error.response ? error.response.data : error.message);
      return {
        success: false,
        errorMessage: 'Failed to create Cashfree payment',
        failureUrl: 'https://www.thegearmates.com/payment-failure'
      };
    
     
    }
  }






  async handleCashfreeWebhook(req: any, res: any): Promise<void> {
    try {
      // Verify webhook signature
      const receivedSignature = req.headers["x-webhook-signature"];
      const rawBody = JSON.stringify(req.body);
      const timestamp = req.headers["x-webhook-timestamp"];
  
      console.log('Received webhook:', rawBody);
  
      // Generate expected signature
      const expectedSignature = Cashfree.PGVerifyWebhookSignature(
        receivedSignature,
        rawBody,
        timestamp,
      );
  
      console.log('Received Signature:', receivedSignature);
      console.log('Generated Signature:', expectedSignature);
  
      if (!expectedSignature) {
        console.error('Invalid webhook signature');
        return res.sendStatus(200); // Still acknowledge receipt
      }
  
      // Proceed with processing the event
      const event = req.body;
      if (event.event === 'payment.success') {
        // Update order status
        try {
          const order = await this.orderRepo.findOne({
            where: { orderID: event.data.order_id }, // Make sure this matches how you store Cashfree's order ID
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
          console.error('Error processing successful payment:', error);
          // Don't throw here, just log the error
        }
      } else {
        console.log('Received non-payment.success event:', event.event);
      }
  
      res.sendStatus(200); // Always acknowledge receipt of the webhook
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.sendStatus(200); // Still acknowledge receipt of the webhook
    }
  }
}

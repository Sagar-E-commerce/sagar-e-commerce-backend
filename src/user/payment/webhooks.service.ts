import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from 'crypto';
import { Request, Response } from 'express'
import { OrderService } from "../order/order.service";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "src/Entity/order.entity";
import { OrderRepository } from "../user.repository";

@Injectable()
export class WebhookService{
    constructor(private configservice: ConfigService,
      @InjectRepository(OrderEntity) private readonly orderipo:OrderRepository){}


  async handlePaystackWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Validate event
      const hash = crypto
        .createHmac(
          'sha512',
          this.configservice.get('PAYSTACK_TEST_SECRET'),
        )
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash === req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        if (event.event === 'charge.success') {
          //mark order as paid 
          const reference = event.data.reference;
          const order = await this.orderipo.findOne({ where: { id: reference } });

          if (!order) {
            console.error(`Order with reference ID ${reference} not found.`);
            res.sendStatus(404);
            return;
          }

          // Mark order as paid
          order.isPaid = true;
          await this.orderipo.save(order);
          console.log(`Order with reference ID ${reference} have been marked as paid`)
         

          
        } else {
          console.log('Unsupported Paystack webhook event', event.event);
        }
        // Do something with event
        console.log('Paystack webhook event:', event);
      } else {
        console.error('Invalid Paystack webhook signature');
      }
    } catch (error) {
      console.error('Error handling Paystack webhook:', error);
    } finally {
      res.sendStatus(200);
    }
  }
}
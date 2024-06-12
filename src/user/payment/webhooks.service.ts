import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from 'src/Entity/order.entity';
import { ProductEntity } from 'src/Entity/products.entity';
import { UserEntity } from 'src/Entity/users.entity';


@Injectable()
export class WebhookService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OrderEntity) private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(ProductEntity) private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {}

  async handlePaystackWebhook(req: Request, res: Response): Promise<void> {
    try {
      const secret = this.configService.get<string>('PAYSTACK_TEST_SECRET');
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;

        if (event.event === 'charge.success') {
          const reference = event.data.reference;
          const order = await this.orderRepo.findOne({
            where: { id: reference },
            relations: ['items', 'items.product','user'],
          });

          if (!order) {
            console.error(`Order with reference ID ${reference} not found.`);
            res.sendStatus(404);
            return;
          }

          order.isPaid = true;

          for (const item of order.items) {
            item.product.purchaseCount += item.quantity;
            await this.productRepo.save(item.product);
          }

          await this.orderRepo.save(order);

            // Update total revenue for the user
            const user = order.user;
            user.totalRevenue += order.total;
            await this.userRepo.save(user);

          console.log(`Order with reference ID ${reference} has been marked as paid.`);
        } else {
          console.log('Unsupported Paystack webhook event:', event.event);
        }

        console.log('Paystack webhook event:', event);
      } else {
        console.error('Invalid Paystack webhook signature');
        res.sendStatus(400);
        return;
      }
    } catch (error) {
      console.error('Error handling Paystack webhook:', error);
      throw new InternalServerErrorException(
        'An error occurred while handling the Paystack webhook',
        error.message,
      );
    } finally {
      res.sendStatus(200);
    }
  }
}

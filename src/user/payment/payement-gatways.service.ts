import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/Entity/cart.entity';
import { CartRepository, OrderRepository } from '../user.repository';
import axios from 'axios';
import { Notifications } from 'src/Entity/notifications.entity';
import { NotificationRepository } from 'src/common/common.repositories';
import { OrderEntity } from 'src/Entity/order.entity';

@Injectable()
export class PaymentGatewaysService {
  constructor(
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(Notifications)
    private readonly notificationRepo: NotificationRepository,
  ) {}

  //process payment with paystack
  async processPayment(
    my_order: OrderEntity,
    totalamount: number,
  ): Promise<PaymentResponse> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: my_order.id },
        relations: ['user', 'items'],
      });
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${order.id} does not exist`,
        );

      // Paystack payment integration
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: totalamount * 100, // Convert to kobo (Paystack currency)
          email: order.user.email, // Customer email for reference
          reference: order.id.toString(), // Order ID as payment reference
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === true) {
        console.log('payment successful');
      } else {
        throw new InternalServerErrorException(
          'Payment initialization failed. Please try again later',
        );
      }
      //save the notification
      const notification = new Notifications();
      notification.account = order.user.id;
      notification.subject = 'Payment Order initiated!';
      notification.message = `the user with id ${order.user.id} have initiated payment `;
      await this.notificationRepo.save(notification);

      return response.data;
    } catch (error) {
      console.error(error);
      let errorMessage = 'Payment processing failed. Please try again later';

      // Handle specific Paystack errors (optional)
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message;
      }

      throw new InternalServerErrorException(errorMessage);
    }
  }



  //process guest payment with paystack
  async processGuestPayment(
    my_order: OrderEntity,
    totalamount: number,
    email:string
  ): Promise<PaymentResponse> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: my_order.id },
        relations: ['items'],
      });
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${order.id} does not exist`,
        );


      // Paystack payment integration
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: totalamount * 100, // Convert to kobo (Paystack currency)
          email: email, // Customer email for reference
          reference: order.id.toString(), // Order ID as payment reference
          currency: 'NGN',
        },

        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === true) {
        console.log('payment successful');
      } else {
        throw new InternalServerErrorException(
          'Payment initialization failed. Please try again later',
        );
      }
      //save the notification
      const notification = new Notifications();
      notification.account = order.name;
      notification.subject = 'Payment Order initiated!';
      notification.message = `the user  ${order.name} have initiated payment `;
      await this.notificationRepo.save(notification);

      return response.data;
    } catch (error) {
      console.error(error);
      let errorMessage = 'Payment processing failed. Please try again later';

      // Handle specific Paystack errors (optional)
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message;
      }

      throw new InternalServerErrorException(errorMessage);
    }
  }
}

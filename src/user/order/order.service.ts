import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity, CartItemEntity } from 'src/Entity/cart.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { UserEntity } from 'src/Entity/users.entity';
import {
  DiscountRepository,
  DiscountUsageRepository,
  NotificationRepository,
  ProductRepository,
} from 'src/common/common.repositories';
import {
  CartItemRepository,
  CartRepository,
  FeedBackRepository,
  NewsletterRepository,
  OrderRepository,
  UserRepository,
} from '../user.repository';
import { ProductEntity } from 'src/Entity/products.entity';
import { OrderEntity, OrderItemEntity } from 'src/Entity/order.entity';
import { ILike } from 'typeorm';
import { IOrder } from './order';
import { GeneatorService } from 'src/common/services/generator.service';
import { Mailer } from 'src/common/mailer/mailer.service';
import { OrderStatus, paymentType } from 'src/Enums/all-enums';
import { FedbackDto, NewsLetterDto, ProcessPaymentDto, confirmOrderDto } from '../dto/otherDto';
import {
  DiscountCouponEntity,
  DiscountUsageEntity,
  ShippingFlatRateEntity,
} from 'src/Entity/discountCoupon.entity';
import { PaymentGatewaysService } from '../payment/payement-gatways.service';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { ShippingFlatRateRepository } from 'src/admin/admin.repository';
import { ShiprocketService } from 'src/common/services/shiprocket.service';
import { error } from 'console';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepository,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: CartItemRepository,
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(DiscountCouponEntity)
    private readonly discountripo: DiscountRepository,
    @InjectRepository(DiscountUsageEntity)
    private readonly discountusageripo: DiscountUsageRepository,
    @InjectRepository(ShippingFlatRateEntity)
    private readonly flatrateripo: ShippingFlatRateRepository,
    private generatorservice: GeneatorService,
    private paymentservice: PaymentGatewaysService,
    private mailer: Mailer,
    private shiprocketservice: ShiprocketService,
  ) {}

  async GuestCreateOrderFromCart(cartID: string): Promise<IOrder> {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id: cartID },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      console.log('Calculating subtotal and total weight for cart items');
      // Calculate the total of all items in the cart, including tax if applicable, and total weight
      const { subtotal, totalWeight } = cart.items.reduce(
        (acc, item) => {
          const productPrice = item.price * item.quantity;
          const taxAmount = item.product.hasTax
            ? productPrice * (item.product.taxRate / 100)
            : 0;
          acc.subtotal += productPrice + taxAmount;
          acc.totalWeight += item.product.weight * item.quantity;
          return acc;
        },
        { subtotal: 0, totalWeight: 0 },
      );

      // Get the latest flat rate
      const [flatrate] = await this.flatrateripo.find({
        order: { createdAt: 'DESC' },
        take: 1,
      });
      if (!flatrate) throw new NotFoundException('shipping flatrate not found');

      // Convert flat rate to number
      const shippingFee = Number(flatrate.flateRate);

      const order = this.orderRepo.create({
        orderID: `#BnsO-${await this.generatorservice.generateOrderID()}`,
        subTotal: subtotal,
        weight: totalWeight,
        shippinFee: shippingFee,
        total: subtotal + shippingFee,
        isPaid: false,
        createdAT: new Date(),
        trackingID: `BnS-${await this.generatorservice.generateTrackingID()}`,
        status: OrderStatus.PROCESSING,
      });

      console.log('Adding items to order');
      // Add items to the order
      order.items = cart.items.map((cartItem) => {
        const orderItem = new OrderItemEntity();
        orderItem.product = cartItem.product;
        orderItem.quantity = cartItem.quantity;
        orderItem.price = cartItem.price;
        return orderItem;
      });

      cart.isCheckedOut = true;
      await this.cartRepo.save(cart);
      await this.orderRepo.save(order);

      // Save the notification
      const notification = new Notifications();
      notification.account = cart.id;
      notification.subject = 'Order Created!';
      notification.message = `The user with id ${order.name} has created an order.`;
      await this.notficationrepo.save(notification);

      console.log('Order successfully created:', order);
      return order;
    } catch (error) {
      console.error('Error in CreateOrderFromCart:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(
          'Something went wrong while trying to create an order from the cart, please try again later',
          error.message,
        );
      }
    }
  }

  async CreateOrderFromCart(User: UserEntity): Promise<IOrder> {
    try {
      console.log('Finding user with id:', User.id);
      const user = await this.userRepo.findOne({ where: { id: User.id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      console.log('Finding cart for user with id:', user.id);
      const cart = await this.cartRepo.findOne({
        where: { user: user },
        relations: ['items', 'items.product', 'user'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      console.log('Calculating subtotal and total weight for cart items');
      // Calculate the total of all items in the cart, including tax if applicable, and total weight
      const { subtotal, totalWeight } = cart.items.reduce(
        (acc, item) => {
          const productPrice = item.price * item.quantity;
          const taxAmount = item.product.hasTax
            ? productPrice * (item.product.taxRate / 100)
            : 0;
          acc.subtotal += productPrice + taxAmount;
          acc.totalWeight += item.product.weight * item.quantity;
          return acc;
        },
        { subtotal: 0, totalWeight: 0 },
      );
      // Get the latest flat rate      // Calculate the total of all items in the cart, including tax if applicable

      const [flatrate] = await this.flatrateripo.find({
        order: { createdAt: 'DESC' },
        take: 1,
      });
      if (!flatrate) throw new NotFoundException('shipping flatrate not found');

      // Convert flat rate to number
      const shippingFee = Number(flatrate.flateRate);

      console.log('Creating order for user with id:', user.id);
      const order = this.orderRepo.create({
        user: user,
        orderID: `#BnsO-${await this.generatorservice.generateOrderID()}`,
        subTotal: subtotal,
        shippinFee: shippingFee,
        total: subtotal + shippingFee,
        weight: totalWeight,
        isPaid: false,
        createdAT: new Date(),
        trackingID: `BnS-${await this.generatorservice.generateTrackingID()}`,
        status: OrderStatus.PROCESSING,
      });

      console.log('Adding items to order');
      // Add items to the order
      order.items = cart.items.map((cartItem) => {
        const orderItem = new OrderItemEntity();
        orderItem.product = cartItem.product;
        orderItem.quantity = cartItem.quantity;
        orderItem.price = cartItem.price;
        return orderItem;
      });

      cart.isCheckedOut = true;
      await this.cartRepo.save(cart);
      await this.orderRepo.save(order);

      // Save the notification
      const notification = new Notifications();
      notification.account = cart.user.id;
      notification.subject = 'Order Created!';
      notification.message = `The user with id ${cart.user.id} has created an order.`;
      await this.notficationrepo.save(notification);

      console.log('Order successfully created:', order);
      return order;
    } catch (error) {
      console.error('Error in CreateOrderFromCart:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(
          'Something went wrong while trying to create an order from the cart, please try again later',
          error.message,
        );
      }
    }
  }

  //triggered byt the payment gateway webhook
  async markOrderAsPaid(orderID: string): Promise<IOrder> {
    try {
      const order = await this.orderRepo.findOne({ where: { id: orderID } });
      if (!order) throw new NotFoundException('order not found');

      order.isPaid = true;
      await this.orderRepo.save(order);
      return order;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to mark order as paid, please try again later',
          error.message,
        );
      }
    }
  }

  //guarded user
  async confirmOrder(
    User: UserEntity,
    dto: confirmOrderDto,
    orderID: string,
  ){
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID, user: User, isPaid: false },
        relations: ['user', 'items'],
      });
      if (!order) throw new NotFoundException('order not found');

      if (dto.promoCode) {
        // Check the coupon code
        const coupon = await this.discountripo.findOne({
          where: { OneTime_discountCode: dto.promoCode },
        });

        if (!coupon) {
          throw new NotFoundException(
            'wrong coupon code provided, please provide a valid coupon',
          );
        }

        // Check if coupon code is expired
        if (coupon.expires_in <= new Date()) {
          throw new NotAcceptableException(
            'sorry the coupon code provided is already expired',
          );
        }

        // Apply the discount if promo code is valid
        order.discount = coupon.percentageOff;
        order.IsCouponCodeApplied = true;
        const totalWithDiscount =
          (Number(order.subTotal) * Number(order.discount)) / 100;
        order.total = Number(order.subTotal) - Number(totalWithDiscount);
      } else {
        // If no promo code is provided, use the original total
        order.total = Number(order.subTotal) + Number(order.shippinFee);
      }

      // Continue the order
      order.orderType = dto.orderType;
      order.name = dto.name;
      order.mobile = dto.mobile;
      order.billing_address = dto.billing_address;
      order.email = dto.email;

      await this.orderRepo.save(order);

      return {message:'the order has been successfully placed, Please Proceed to make Payment',order};
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to confirm an order, please try again later',
          error.message,
        );
      }
    }
  }


  async processPayment(orderID: string, dto: ProcessPaymentDto): Promise<string> {
    const order = await this.orderRepo.findOne({
      where: { id: orderID, isPaid: false },
      relations: ['user', 'items','items.product'],
    });
    if (!order) throw new NotFoundException('order not found');
    const receiptid = await this.generatorservice.generatereceiptID();

    // Proceed with the selected payment gateway
    const paymentResult = await this.paymentservice.processPayment(order.id,dto);

    if (paymentResult.success) {
      order.isPaid = true;
      await this.orderRepo.save(order);

         // Prepare the items array for the receipt and forward it to the user's mail
         const items = order.items.map((item) => ({
          description: item.product.name,
          quantity: item.quantity,
          price: item.price,
        }));
        await this.mailer.sendOrderConfirmationWithReceipt(
          order.user.email,
          order.user.fullname,
          order.trackingID,
          receiptid,
          items,
          order.total,
        );
           //reccomend dispatch route 
           await this.shiprocketservice.recommendDispatchService(order);
      return 'Payment successful';
    } else {
      console.log(error)
      throw new Error('Payment failed',);
    }
  }
}

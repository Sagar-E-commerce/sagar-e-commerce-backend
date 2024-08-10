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
import {
  CourierDto,
  FedbackDto,
  NewsLetterDto,
  ProcessPaymentDto,
  confirmOrderDto,
} from '../dto/otherDto';
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
     

      console.log('Creating order for user with id:', user.id);
      const order = this.orderRepo.create({
        user: user,
        orderID: `TgmO-${await this.generatorservice.generateOrderID()}`,
        subTotal: subtotal,
        shippinFee: 0,
        total: subtotal,
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
      console.log('Error in CreateOrderFromCart:', error);
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

  /////// shipmemts  ///////

  //fetch available courier services 
  async FetchAvailableCourierService(
    User: UserEntity,
    orderId: string,
  ){
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: User.id } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const availableCouriers = await this.shiprocketservice.getAvailableCouriers(
      '110032',
      order.billing_pincode,
      order.weight,
      order.subTotal,
    );
    
    // Store only the courier IDs in the order entity
    order.availableCourierIds = availableCouriers.map(courier => courier.id.toString());
    await this.orderRepo.save(order);
    
    return availableCouriers;
  }
  //select courier service and then append the shipping cost based on the courier selected
  async selectCourier(
    User: UserEntity,
    orderId: string,
    dto: CourierDto,
  ): Promise<IOrder> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId, user: { id: User.id } },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
  
     
      const availableCouriers =
      await this.shiprocketservice.getAvailableCouriers(
        '110032',
        order.billing_pincode,
        order.weight,
        order.subTotal,
      );
    const selectedCourier = availableCouriers.find(
      (courier) => courier.id === dto.courierID,
    );

    if (!selectedCourier) {
      throw new BadRequestException('Invalid courier selected');
    }
  
      order.shippinFee = selectedCourier.rate;
      order.total = Number(order.subTotal) + Number(order.shippinFee);
      order.courierInfo = {
        id: selectedCourier.courier_company_id.toString(),
        name: selectedCourier.courier_name,
      };
  
      // Clear the availableCourierIds after selection
      order.availableCourierIds = null;
  
      await this.orderRepo.save(order);
  
      // Save the notification
      // const notification = new Notifications();
      // notification.account = order.user.id;
      // notification.subject = 'Available Courier Service Selected Powered by Shiprocket!';
      // notification.message = `The user with id ${order.user.id} has successfully selected the Available Courier Service.`;
      // await this.notficationrepo.save(notification);
  
      return order;
    } catch (error) {
      console.error('Error in selectCourier:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong while selecting the courier', error.message);
      }
    }
  }
  // create shipment  ////

  
  async createShipment(
    User: UserEntity,
    orderId: string,
  ): Promise<any> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId, user: { id: User.id } },
        relations: ['user', 'items', 'items.product'],
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (!order.courierInfo) {
        throw new BadRequestException('No courier selected for this order');
      }

       // Split the full name into first and last name
    const nameParts = order.user.fullname.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const shipmentData = {
      order_id: order.id.toString(),
      order_date: order.createdAT.toISOString().split('T')[0],
      pickup_location: "Primary",
      channel_id: "5203747",
      comment: "Create Shipment",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.billing_address,
      billing_address_2: order.billing_address || "", // Use a separate field if available
      billing_city: order.billing_city,
      billing_pincode: order.billing_pincode.toString(),
      billing_state: order.billing_state,
      billing_country: order.user.Nationality || "India",
      billing_email: order.user.email,
      billing_phone: order.user.mobile || "9205163669", // Use the user's actual phone number
      shipping_is_billing: true,
      shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: order.billing_address,
    shipping_address_2: order.billing_address_2,
    shipping_city: order.billing_city,
    shipping_pincode: order.billing_pincode,
    shipping_country: order.user.Nationality || "India",
    shipping_state: order.billing_state,
    shipping_email: order.user.email,
    shipping_phone: order.user.mobile || "9205163669" ,
      order_items: order.items.map(item => ({
        name: item.product.name,
        sku: item.product.sku || `SKU-${item.product.id}`,
        units: item.quantity.toString(),
        selling_price: item.price.toString(),
        discount: "",
        tax: "",
        hsn: ""
      })),
      payment_method: order.paymentMethod || 'prepaid',
      shipping_charges: "",
      giftwrap_charges: "",
      transaction_charges: "",
      total_discount: "",
      sub_total: order.subTotal.toString(),
      length: "10",
      breadth: "10",
      height: "10",
      weight: (order.weight || 1).toString(),
    };

      console.log('Shipment Data:', JSON.stringify(shipmentData, null, 2));

      const shipmentResponse = await this.shiprocketservice.createShipment(shipmentData);
  
      console.log('Shipment Response:', JSON.stringify(shipmentResponse, null, 2));

      

      order.shipmentID = shipmentResponse.shipment_id;
      order.awbCode = shipmentResponse.awb_code;
      await this.orderRepo.save(order);

      const notification = new Notifications();
      notification.account = order.user.id;
      notification.subject = 'Shipment Created';
      notification.message = `Shipment created for order ${order.id}. AWB: ${shipmentResponse.awb_code}`;
      await this.notficationrepo.save(notification);

      return shipmentResponse;
    } catch (error) {
      console.error('Error in createShipment:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong while creating the shipment', error.message);
      }
    }
  }
  //request for pickup service ///

  async RequestPickup(User: UserEntity, orderId: string): Promise<any> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId, user: { id: User.id } },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Request Pickup from Shiprocket
      const pickupResponse = await this.shiprocketservice.requestPickup(order);
      if (pickupResponse) {
        order.shiprocketPickupStatus = pickupResponse.pickup_status;
        order.shiprocketPickupToken =
          pickupResponse.response.pickup_token_number;
        await this.orderRepo.save(order);
      }

      // Save the notification
      const notification = new Notifications();
      notification.account = order.user.id;
      notification.subject = 'PickUp Requested Powered by Shiprocket!';
      notification.message = `The user with id ${order.user.id} has successfully requested for a pickup.`;
      await this.notficationrepo.save(notification);

      return {
        message: 'pickup successfully requested',
        pickupResponse,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.error(error);
        throw new InternalServerErrorException(
          'something went wrong',
          error.message,
        );
      }
    }
  }

  //guarded user
  async confirmOrder(User: UserEntity, dto: confirmOrderDto, orderID: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID, user: { id: User.id }, isPaid: false },
        relations: ['user', 'items'],
      });
      console.log(order);
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
      order.billing_city = dto.billing_city;
      order.billing_pincode = dto.billing_pincode;
      order.billing_state = dto.billing_state;
      order.email = dto.email;
      await this.orderRepo.save(order);

      // Save the notification
      const notification = new Notifications();
      notification.account = order.user.id;
      notification.subject = 'Order Confirmed Successfully!';
      notification.message = `The user with id ${order.user.id} has successfully confimed an order.`;
      await this.notficationrepo.save(notification);

      return {
        message:
          'the order has been successfully placed, Please Proceed to make Payment',
        order,
      };
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

  async processPayment(orderID: string, dto: ProcessPaymentDto) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID, isPaid: false },
        relations: ['user', 'items', 'items.product'],
      });
      if (!order) throw new NotFoundException('order not found');

      //roceed with the selected payment gateway
      const paymentResult = await this.paymentservice.processPayment(
        order.id,
        dto,
      );

      return paymentResult;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong',
        error.message,
      );
    }
  }

  //get all order
  async GetAllOrder(user: UserEntity, page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await this.orderRepo.findAndCount({
        where: { user: { id: user.id } },
        skip: skip,
        take: limit,
        relations: ['items', 'items.product'],
      });
      if (orders[1] === 0)
        throw new NotFoundException('no orders have been posted at the moment');

      return orders;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update order status, please try again later',
          error.message,
        );
      }
    }
  }

  //get one order
  async GetOneOrder(user: UserEntity, orderID: string): Promise<IOrder> {
    try {
      const order = await this.orderRepo.findOne({
        where: { user: { id: user.id }, id: orderID },
        relations: ['items', 'items.product'],
      });
      if (!order) throw new NotFoundException('order not found');

      return order;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch one user, please try again later',
          error.message,
        );
      }
    }
  }
}

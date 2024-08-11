import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DiscountCouponEntity,
  IDiscountCoupon,
  IShippingFlatRate,
  ShippingFlatRateEntity,
} from 'src/Entity/discountCoupon.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderStatus } from 'src/Enums/all-enums';
import { ShippingFlatRateRepository } from 'src/admin/admin.repository';
import {
  DiscountDto,
  EditflatRateDto,
  UpdateDiscountDto,
  flatRateDto,
  updateOrderStatusDto,
} from 'src/admin/dto/otherDto';
import {
  DiscountRepository,
  NotificationRepository,
} from 'src/common/common.repositories';
import { Mailer } from 'src/common/mailer/mailer.service';
import { IOrder } from 'src/user/order/order';
import { OrderRepository } from 'src/user/user.repository';
import { ILike } from 'typeorm';

@Injectable()
export class OrderMgtService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(Notifications)
    private readonly notificationripo: NotificationRepository,
    @InjectRepository(DiscountCouponEntity)
    private readonly discountripo: DiscountRepository,
    @InjectRepository(ShippingFlatRateEntity)
    private readonly flatrateripo: ShippingFlatRateRepository,

    private mailer: Mailer,
  ) {}

  //get all order
  async GetAllOrder(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await this.orderRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['user', 'items'],
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
          'something went wrong while trying to update order status, please try again later',error.message
        );
      }
    }
  }

  //get one order
  async GetOneOrder(orderID: string): Promise<IOrder> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID },
        relations: ['user', 'items'],
      });
      if (!order) throw new NotFoundException('order not found');

      return order;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update order status, please try again later',error.message
        );
      }
    }
  }

  //get all order based on status as delivered
  async GetAllOrderDelivered(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await this.orderRepo.findAndCount({
        where: { status: OrderStatus.DELIVERED },
        skip: skip,
        take: limit,
        relations: ['user', 'items'],
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
          'something went wrong while trying to fetch orders that are delivered, please try again later',error.message
        );
      }
    }
  }

  //get all order based on status as procesing
  async GetAllOrderProcessing(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await this.orderRepo.findAndCount({
        where: { status: OrderStatus.PROCESSING },
        skip: skip,
        take: limit,
        relations: ['user', 'items'],
      });
      if (orders[1] === 0)
        throw new NotFoundException(
          'no orders are being processed at the moment',
        );

      return orders;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch orders that are being processed, please try again later',error.message
        );
      }
    }
  }

  //get all order based on status as shipped
  async GetAllOrderShipped(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await this.orderRepo.findAndCount({
        where: { status: OrderStatus.SHIPPED },
        skip: skip,
        take: limit,
        relations: ['user', 'items'],
      });
      if (orders[1] === 0)
        throw new NotFoundException('no shipped orders  at the moment');

      return orders;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch orders that have been shipped, please try again later',error.message
        );
      }
    }
  }

  // update status of order
  async UpdateOrderStatus(dto: updateOrderStatusDto, orderID: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID },
        relations: ['user', 'items',"items.product"],
      });
      if (!order) throw new NotFoundException('order not found');

      order.status = dto.status;
      order.updatedAT = new Date();

      if (dto && dto.status === OrderStatus.DELIVERED) {
        //foward mail
        await this.mailer.ParcelDroppedOfMail(
          order.user.email,
          order.user.fullname,
          order.trackingID,
        );
      }

      await this.orderRepo.save(order);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update order status, please try again later',error.message
        );
      }
    }
  }

  // track order
  async TrackOrder(keyword: string | any): Promise<IOrder> {
    try {
      //find order
      const trackorder = await this.orderRepo.findOne({
        where: { trackingID: ILike(`%${keyword}`) },
        relations: ['user', 'items', 'items.product'],
        cache: false,
        comment:
          'tracking order with the trackingToken generated by the system',
      });
      if (!trackorder)
        throw new NotFoundException(
          `oops! this trackingID ${keyword} is not associated with any order in Baby n' Stuff`,
        );

      return trackorder;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trackin an order, please try again later',error.message
        );
      }
    }
  }

  // set discount
  async SetDiscountAndDuration(dto: DiscountDto) {
    try {
      const discount = new DiscountCouponEntity();
      discount.OneTime_discountCode = dto.discountCode;
      discount.createdAT = new Date();
      discount.DiscountDuration_days = dto.DiscountDuration_days;
      discount.DiscountDuration_weeks = dto.DiscountDuration_weeks;

      // scnerio where discount duration in days was given
      if (dto.DiscountDuration_days) {
        discount.expires_in = new Date(
          discount.createdAT.getTime() +
            dto.DiscountDuration_days * 24 * 60 * 60 * 1000,
        );
        //scenerio where duration in weeks is given
      } else if (dto.DiscountDuration_weeks) {
        discount.expires_in = new Date(
          discount.createdAT.getTime() +
            dto.DiscountDuration_weeks * 7 * 24 * 60 * 60 * 1000,
        );
      }

      discount.percentageOff = dto.percentageOff;
      discount.isExpired = false;

      await this.discountripo.save(discount);

      //notifiction
      const notification = new Notifications();
      notification.account = 'super admin';
      notification.subject = 'Discount Created!';
      notification.message = `the Admin have set a new promo Discout on ostra logistics `;
      await this.notificationripo.save(notification);

      return discount;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to set a promo discount',error.message
      );
    }
  }

  //update discount

  async Updatediscount(dto: UpdateDiscountDto, discountID: number) {
    try {
      const discount = await this.discountripo.findOne({
        where: { id: discountID },
      });
      if (!discount)
        throw new NotFoundException(
          `discount with  ${discountID} is not found in the system`,
        );

      discount.OneTime_discountCode = dto.discountCode;
      discount.updatedAT = new Date();
      discount.DiscountDuration_days = dto.DiscountDuration_days;
      discount.DiscountDuration_weeks = dto.DiscountDuration_weeks;

      // scnerio where discount duration in days was given
      if (dto.DiscountDuration_days) {
        discount.expires_in = new Date(
          discount.updatedAT.getTime() +
            dto.DiscountDuration_days * 24 * 60 * 60 * 1000,
        );
        //scenerio where duration in weeks is given
      } else if (dto.DiscountDuration_weeks) {
        discount.expires_in = new Date(
          discount.updatedAT.getTime() +
            dto.DiscountDuration_weeks * 7 * 24 * 60 * 60 * 1000,
        );
      }

      discount.percentageOff = dto.percentageOff;
      discount.isExpired = false;

      await this.discountripo.save(discount);

      //notifiction
      const notification = new Notifications();
      notification.account = 'super admin';
      notification.subject = 'Discount updated!';
      notification.message = `the Admin have update a promo discount  on baby n' stuff `;
      await this.notificationripo.save(notification);

      return discount;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update the promo discount ',error.message
        );
      }
    }
  }

  async GetCoupons(): Promise<IDiscountCoupon[]> {
    try {
      //find  coupon
      const coupons = await this.discountripo.find();

      if (!coupons)
        throw new NotFoundException(
          `oops! no coupons have been created at the moment`,
        );

      return coupons;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while fetching coupons, please try again later',error.message
        );
      }
    }
  }

  //delete discount
  async deleteDiscount(discountID: number) {
    try {
      const discount = await this.discountripo.findOne({
        where: { id: discountID },
      });
      if (!discount)
        throw new NotFoundException(
          `discount with  ${discountID} is not found in ostra logistics`,
        );

      //remove the discount
      await this.discountripo.remove(discount);
      return { message: 'coupon code removed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to delete a coupon code ',error.message
        );
      }
    }
  }

  async SetFlatRate(dto: flatRateDto) {
    try {
      const flatRate = new ShippingFlatRateEntity();
      flatRate.flateRate = dto.flatRate;
      flatRate.currency = dto.currency;
      flatRate.createdAt = new Date();

      await this.flatrateripo.save(flatRate);

      //notifiction
      const notification = new Notifications();
      notification.account = 'super admin';
      notification.subject = 'FlatRate Created!';
      notification.message = `the Admin have set a new FlatRate on baby n stuff `;
      await this.notificationripo.save(notification);

      return flatRate;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to set a shipping flatrate',error.message
      );
    }
  }

  async EditFlatRate(dto: EditflatRateDto, flatRateID: number) {
    try {
      const flatRate = await this.flatrateripo.findOne({
        where: { id: flatRateID },
      });
      if (!flatRate) throw new NotFoundException('flat rate not found');

      flatRate.flateRate = dto.flatRate;
      flatRate.currency = dto.currency;
      flatRate.updatedAt = new Date();

      await this.flatrateripo.save(flatRate);

      //notifiction
      const notification = new Notifications();
      notification.account = 'super admin';
      notification.subject = 'FlatRate Updated!';
      notification.message = `the Admin have updated FlatRate `;
      await this.notificationripo.save(notification);

      return flatRate;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update the shipping flat rate ,error.message',
        );
      }
    }
  }


  async DeleteFlatRate(flatRateID: number) {
    try {
      
      const flatRate = await this.flatrateripo.findOne({
        where: { id: flatRateID },
      });
  
      if (!flatRate) {
        throw new NotFoundException('Flat rate not found');
      }  
      await this.flatrateripo.remove(flatRate);
  
      // Notification
      const notification = new Notifications();
      notification.account = 'super admin';
      notification.subject = 'FlatRate Deleted!';
      notification.message = `The admin has deleted a flatrate`;
      await this.notificationripo.save(notification);
  
      return { message: "Shipping flat rate deleted successfully" };
    } catch (error) {
      console.log('Error in DeleteFlatRate:', error);
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        throw new InternalServerErrorException(
          'Something went wrong while trying to delete the shipping flat rate', error.message,
        );
      }
    }
  }
  

  async GetflatRate(): Promise<IShippingFlatRate[]> {
    try {
      //find  coupon
      const flateRate = await this.flatrateripo.find();

      if (!flateRate)
        throw new NotFoundException(
          `oops! no flatrate have been created at the moment in Baby n' Stuff`,
        );

      return flateRate;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while fetching flatrates, please try again later',error.message
        );
      }
    }
  }


  async getRevenueFromSuccessfulOrders(): Promise<number> {
    const successfulOrders = await this.orderRepo.find({
      select: ['total'],
      //where: { isPaid: true }
    });
  
    console.log('Fetched orders:', successfulOrders);
  
    const totalRevenue = successfulOrders.reduce((sum, order) => {
      const orderTotal = Number(order.total) || 0;
      console.log(`Processing order total: ${order.total}, converted to: ${orderTotal}`);
      return sum + orderTotal;
    }, 0);
  
    console.log('Calculated total revenue:', totalRevenue);
  
    return Number(totalRevenue.toFixed(2));
  }


}

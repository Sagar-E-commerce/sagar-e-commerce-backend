import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AdminEntity } from 'src/Entity/admin.entity';
import { CartEntity, CartItemEntity } from 'src/Entity/cart.entity';
import {
  DiscountCouponEntity,
  DiscountUsageEntity,
  ShippingFlatRateEntity,
} from 'src/Entity/discountCoupon.entity';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { FavouriteEntity } from 'src/Entity/likes.entity';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { OrderEntity, OrderItemEntity } from 'src/Entity/order.entity';
import { UserOtp } from 'src/Entity/otp.entity';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import { CategoryEntity } from 'src/Entity/productCategory.entity';
import { ProductEntity } from 'src/Entity/products.entity';
import { UserEntity } from 'src/Entity/users.entity';
import { VideoEntity } from 'src/Entity/videos.entity';

@Injectable()
export class TypeOrmService {
  constructor(private configservice: ConfigService) {}

  //configure the typeorm service here
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.configservice.get('DATABASE_HOST'),
      port: this.configservice.get('DATABASE_PORT'),
      username: this.configservice.get('DATABASE_USERNAME'),
      password: String(this.configservice.get('DATABASE_PASSWORD')),
      database: this.configservice.get('DATABASE_NAME'),
      synchronize: true,
      logging: false,
      entities: [
        AdminEntity,
        UserEntity,
        UserOtp,
        Notifications,
        CartEntity,
        CartItemEntity,
        OrderEntity,
        OrderItemEntity,
        VideoEntity,
        ProductEntity,
        CategoryEntity,
        DiscountCouponEntity,
        DiscountUsageEntity,
        NewsLetterEntity,
        FeddbackEntity,
        ShippingFlatRateEntity,
        FavouriteEntity,
        PaymentConfigurationEntity
      ],
      migrations: [],
      subscribers: [],
    };
  }
}

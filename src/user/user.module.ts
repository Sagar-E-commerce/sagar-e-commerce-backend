import { Module } from '@nestjs/common';
import { UserAuthController } from './user.auth.controller';
import { ProfileMgtController } from './profile-mgt/profile-mgt.controller';

import { OrderController } from './order/order.controller';
import { CartController } from './cart/cart.controller';
import { UserAuthService } from './user.auth.service';
import { ProfileMgtServices } from './profile-mgt/profile-mgt.service';
import { PaymentGatewaysService } from './payment/payement-gatways.service';

import { OrderService } from './order/order.service';
import { CartService } from './cart/cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/Entity/users.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { UserOtp } from 'src/Entity/otp.entity';
import { GeneatorService } from 'src/common/services/generator.service';
import { UploadService } from 'src/common/services/upload.service';
import { CartEntity, CartItemEntity } from 'src/Entity/cart.entity';
import { ProductEntity } from 'src/Entity/products.entity';
import { OrderEntity, OrderItemEntity } from 'src/Entity/order.entity';
import { JwtService } from '@nestjs/jwt';
import { Mailer } from 'src/common/mailer/mailer.service';
import { DiscountCouponEntity, DiscountUsageEntity, ShippingFlatRateEntity } from 'src/Entity/discountCoupon.entity';
import { DiscountUsageRepository } from 'src/common/common.repositories';
import { BrowseService } from './guest/guest.service';
import { BrowseController } from './guest/guest.controller';
import { VideoEntity } from 'src/Entity/videos.entity';
import { CategoryEntity } from 'src/Entity/productCategory.entity';
import { CloudinaryService } from 'src/common/services/claudinary.service';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { FavouriteEntity } from 'src/Entity/likes.entity';
import { CurrencyController } from './currency-converter/converter.controller';
import { CurrencyService } from './currency-converter/converter.service';
import { ShiprocketService } from 'src/common/services/shiprocket.service';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import { RazorPayPaymentGatewayService } from 'src/admin/dashboard/payment-config/razorpay.service';
import { CashfreePaymentGatewayService } from 'src/admin/dashboard/payment-config/cashfree.service';
import { PayUmoneyPaymentGatewayService } from 'src/admin/dashboard/payment-config/payumoney.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Notifications,
      UserOtp,
      CartEntity,
      CartItemEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
      DiscountCouponEntity,
      DiscountUsageEntity,
      VideoEntity,
      CategoryEntity,
      NewsLetterEntity,
      FeddbackEntity,
      FavouriteEntity,
      ShippingFlatRateEntity,
      PaymentConfigurationEntity
    ]),
  ],
  controllers: [
    UserAuthController,
    ProfileMgtController,
    OrderController,
    CartController,
    BrowseController,
    CurrencyController
  ],
  providers: [
    UserAuthService,
    ProfileMgtServices,
    PaymentGatewaysService,
    OrderService,
    CartService,
    GeneatorService,
    UploadService,
    JwtService,
    Mailer,
    BrowseService,
    CloudinaryService,
    CurrencyService,
    ShiprocketService,
    RazorPayPaymentGatewayService,
    CashfreePaymentGatewayService,
    PayUmoneyPaymentGatewayService
  ],
})
export class UserModule {}

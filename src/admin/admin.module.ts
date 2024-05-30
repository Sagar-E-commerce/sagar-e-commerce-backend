import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { AnalyticsService } from './dashboard/analytics/analytics.service';
import { CustomerMgtService } from './dashboard/customer-mgt/customer.mgt.service';
import { InventoryService } from './dashboard/inventory/inventory.service';
import { OrderMgtService } from './dashboard/order-mgt/order.mgt.service';
import { ProductMgtService } from './dashboard/product-mgt/product.mgt.service';
import { AnalyticsController } from './dashboard/analytics/analytics.controller';
import { CustomerMgtController } from './dashboard/customer-mgt/customer.mgt.controller';
import { InventoryController } from './dashboard/inventory/inventory.controller';
import { OrderMgtcontroller } from './dashboard/order-mgt/order.mgt.controller';
import { ProductMgtController } from './dashboard/product-mgt/product.mgt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from 'src/Entity/admin.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { UserOtp } from 'src/Entity/otp.entity';
import { GeneatorService } from 'src/common/services/generator.service';
import { ProductEntity } from 'src/Entity/products.entity';
import { OrderEntity } from 'src/Entity/order.entity';
import { VideoEntity } from 'src/Entity/videos.entity';
import { UploadService } from 'src/common/services/upload.service';
import { UserEntity } from 'src/Entity/users.entity';
import { Mailer } from 'src/common/mailer/mailer.service';
import { CategoryEntity } from 'src/Entity/productCategory.entity';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryConfig } from 'src/common/config/claudinary.config';
import { CloudinaryService } from 'src/common/services/claudinary.service';
import { DiscountCouponEntity, ShippingFlatRateEntity } from 'src/Entity/discountCoupon.entity';
import { CommonModule } from 'src/common/common.module';
import { AdminProfileMgtServices } from './dashboard/profile-mgt/admin.profilemgt.service';
import { AdminProfileMgtController } from './dashboard/profile-mgt/admin.profilemgt.controller';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { AdminMgtController } from './dashboard/admins-mgt/admins.mgt.controller';
import { AdminsMgtService } from './dashboard/admins-mgt/admins.mgt.service';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      AdminEntity,
      Notifications,
      UserOtp,
      ProductEntity,
      OrderEntity,
      VideoEntity,
      UserEntity,
      CategoryEntity,
      UserEntity,
      DiscountCouponEntity,
      ShippingFlatRateEntity,
      NewsLetterEntity,
      FeddbackEntity
    ]),
  ],
  providers: [
    AdminAuthService,
    AnalyticsService,
    CustomerMgtService,
    InventoryService,
    OrderMgtService,
    ProductMgtService,
    GeneatorService,
    UploadService,
    Mailer,
    CloudinaryConfig,
    CloudinaryService,
    JwtService,
    AdminProfileMgtServices,
    AdminsMgtService
  ],
  controllers: [
    AdminAuthController,
    AnalyticsController,
    CustomerMgtController,
    InventoryController,
    OrderMgtcontroller,
    ProductMgtController,
    AdminProfileMgtController,
    AdminMgtController
  ],
})
export class AdminModule {}

import { DiscountCouponEntity, DiscountUsageEntity } from "src/Entity/discountCoupon.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { UserOtp } from "src/Entity/otp.entity";
import { ProductEntity } from "src/Entity/products.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(UserOtp)
export class OtpRepository extends Repository<UserOtp>{}


@EntityRepository(Notifications)
export class NotificationRepository extends Repository<Notifications>{}

@EntityRepository(ProductEntity)
export class ProductRepository extends Repository<ProductEntity>{}

@EntityRepository(DiscountUsageEntity)
export class DiscountUsageRepository extends Repository<DiscountUsageEntity>{}

@EntityRepository(DiscountCouponEntity)
export class DiscountRepository extends Repository<DiscountCouponEntity>{}
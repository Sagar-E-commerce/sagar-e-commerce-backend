import { AdminEntity } from "src/Entity/admin.entity";
import { ShippingFlatRateEntity } from "src/Entity/discountCoupon.entity";
import { CategoryEntity } from "src/Entity/productCategory.entity";
import { VideoEntity } from "src/Entity/videos.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(AdminEntity)
export class AdminRepository extends Repository<AdminEntity>{}


@EntityRepository(VideoEntity)
export class VideoRepository extends Repository<VideoEntity>{}

@EntityRepository(CategoryEntity)
export class CategoryRepository extends Repository<CategoryEntity>{}

@EntityRepository(ShippingFlatRateEntity)
export class ShippingFlatRateRepository extends Repository<ShippingFlatRateEntity>{}
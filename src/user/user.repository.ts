import { CartEntity, CartItemEntity } from "src/Entity/cart.entity";
import { FeddbackEntity } from "src/Entity/feedback.entity";
import { FavouriteEntity } from "src/Entity/likes.entity";
import { NewsLetterEntity } from "src/Entity/newsletter.entity";
import { OrderEntity, OrderItemEntity } from "src/Entity/order.entity";
import { CashFreeEntity, PayUmoneyEntity, PaymentConfigurationEntity, RazorPayEntity } from "src/Entity/paymentConfig.entity";
import { UserEntity } from "src/Entity/users.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity>{}


@EntityRepository(CartEntity)
export class CartRepository extends Repository<CartEntity>{}

@EntityRepository(CartItemEntity)
export class CartItemRepository extends Repository<CartItemEntity>{}

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity>{}


@EntityRepository(OrderItemEntity)
export class OrderItemRepository extends Repository<OrderItemEntity>{}

@EntityRepository(NewsLetterEntity)
export class NewsletterRepository extends Repository<NewsLetterEntity>{}


@EntityRepository(FeddbackEntity)
export class FeedBackRepository extends Repository<FeddbackEntity>{}

@EntityRepository(FavouriteEntity)
export class LikeRepository extends Repository<FavouriteEntity>{}


@EntityRepository(PaymentConfigurationEntity)
export class PaymentConfigurationRepository extends Repository<PaymentConfigurationEntity>{}

@EntityRepository(RazorPayEntity)
export class RazorPayRepository extends Repository<RazorPayEntity>{}

@EntityRepository(PayUmoneyEntity)
export class PayUmoneyRepostory extends Repository<PayUmoneyEntity>{}

@EntityRepository(CashFreeEntity)
export class CashFreeRepository extends Repository<CashFreeEntity>{}


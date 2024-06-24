import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IFavourites, FavouriteEntity } from 'src/Entity/likes.entity';
import { CategoryEntity, ICategory } from 'src/Entity/productCategory.entity';
import { ProductEntity } from 'src/Entity/products.entity';
import { UserEntity } from 'src/Entity/users.entity';
import { VideoEntity } from 'src/Entity/videos.entity';
import {
  CategoryRepository,
  VideoRepository,
} from 'src/admin/admin.repository';
import {
  DiscountRepository,
  NotificationRepository,
  ProductRepository,
} from 'src/common/common.repositories';
import { Between, ILike, Like } from 'typeorm';
import {
  CartItemRepository,
  CartRepository,
  FeedBackRepository,
  LikeRepository,
  NewsletterRepository,
  OrderRepository,
  UserRepository,
} from '../user.repository';
import { paymentType } from 'src/Enums/all-enums';
import {
  AddToCartDto,
  FedbackDto,
  NewsLetterDto,
  UpdateCartItemDto,
  confirmOrderDto,
} from '../dto/otherDto';
import { OrderEntity } from 'src/Entity/order.entity';
import { DiscountCouponEntity } from 'src/Entity/discountCoupon.entity';
import { PaymentGatewaysService } from '../payment/payement-gatways.service';
import { Mailer } from 'src/common/mailer/mailer.service';
import { CartEntity, CartItemEntity } from 'src/Entity/cart.entity';
import { ICart } from '../cart/cart';
import { OrderService } from '../order/order.service';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { IOrder } from '../order/order';
import { Notifications } from 'src/Entity/notifications.entity';
import { ShiprocketService } from 'src/common/services/shiprocket.service';
@Injectable()
export class BrowseService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(VideoEntity) private readonly videoRepo: VideoRepository,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: CategoryRepository,
    @InjectRepository(UserEntity)
    private readonly userRepo: UserRepository,
    @InjectRepository(FavouriteEntity)
    private readonly likesRepo: LikeRepository,
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(DiscountCouponEntity)
    private readonly discountripo: DiscountRepository,
    private paymentservice: PaymentGatewaysService,
    private mailer: Mailer,
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepository,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: CartItemRepository,
    @InjectRepository(NewsLetterEntity)
    private readonly newsletterripo: NewsletterRepository,
    @InjectRepository(FeddbackEntity)
    private readonly feedbackripo: FeedBackRepository,
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
    private orderservice: OrderService,
    private shiprocketservice:ShiprocketService

    
  ) {}

  //fetch all products
  async fetchAllVideos(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const videos = await this.videoRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['product'],
      });
      if (videos[1] === 0)
        throw new NotFoundException(
          'no products have been video at the moment',
        );

      return videos;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',error.message
        );
      }
    }
  }

  //fetch all products
  async fetchAllProducts(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const products = await this.productRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['video', 'category'],
      });
      if (products[1] === 0)
        throw new NotFoundException(
          'no products have been posted at the moment',
        );

      return products;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',error.message
        );
      }
    }
  }


  async fetchLatestProducts(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const [products, total] = await this.productRepo.findAndCount({
        skip,
        take: limit,
        order: {
          createdAT: 'DESC',
        },
        relations: ['video', 'category'],
      });

      if (total === 0) {
        throw new NotFoundException('No products have been posted at the moment');
      }

      return { products, total, page, limit };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to fetch the latest products',
          error.message
        );
      }
    }
  }

  async fetchHottestProducts(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const [products, total] = await this.productRepo.findAndCount({
        skip,
        take: limit,
        order: {
          purchaseCount: 'DESC',
        },
        relations: ['video', 'category'],
      });

      if (total === 0) {
        throw new NotFoundException('No products have been posted at the moment');
      }

      return { products, total, page, limit };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to fetch the hottest products',
          error.message
        );
      }
    }
  }

  //fetch all products
  async fetchOneProduct(productID: number) {
    try {
      const products = await this.productRepo.findOne({
        where: { id: productID },
        relations: ['category', 'video'],
      });
      if (!products) throw new NotFoundException('product with id not found');

      return products;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',error.message
        );
      }
    }
  }

  async searchProducts(
    keyword: string,
    page?: number,
    perPage?: number,
    sort?: string,
    // Add filter options here (e.g., category, price range)
  ): Promise<{ data: ProductEntity[]; total: number }> {
    try {
      const qb = this.productRepo.createQueryBuilder('product');
  
      qb.where('product.name ILIKE :keyword', { keyword: `%${keyword}%`});

      qb.cache(false)
  
      // Add filtering based on additional criteria here
      // ...

  
      if (sort) {
        const [sortField] = sort.split(',');
        qb.orderBy(`product.${sortField}`, 'DESC');
      }
  
      if (page && perPage) {
        qb.skip((page - 1) * perPage).take(perPage);
      }
  
      const [products, total] = await qb.getManyAndCount();
  
      if (!products.length) {
        throw new NotFoundException(
          `No products found matching your search criteria for "${keyword}".`,
        );
      }
  
      return { data: products, total };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'An error occurred while searching for products. Please try again later.',
        );
      }
    }
  }
  

  //fetch all product categories
  async FetchAllProductCategories(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const categories = await this.categoryRepo.findAndCount({
        skip: skip,
        take: limit,
      });
      if (categories[1] === 0)
        throw new NotFoundException(
          'no product category have been created yet',
        );

      return categories;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.error('Error searching user:', error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch product categories ',error.message
        );
      }
    }
  }

  async FetchOneProductCategoriesWithProduct(
    page: number = 1,
    limit: number = 30,
    categoryID: number,
  ) {
    try {
      const skip = (page - 1) * limit;
      const categories = await this.categoryRepo.findAndCount({
        where: { id: categoryID },
        relations: ['products'],
        skip: skip,
        take: limit,
      });
      if (categories[1] === 0)
        throw new NotFoundException(
          'no product category have been created yet',
        );

      return categories;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.error('Error searching user:', error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch the products associated with a category ',error.message
        );
      }
    }
  }

  //add product to favourite and you must be logged in even as a guest

  async AddProductToFavourite(productID: number, user:UserEntity) {
    try {
      const products = await this.productRepo.findOne({
        where: { id: productID },
        relations: ['category', 'video'],
      });
      if (!products) throw new NotFoundException('product with id not found');


      //const like
      const like = await this.likesRepo.create({
        user: user,
        product: products,
        createdAt: new Date(),
      });

      await this.likesRepo.save(like);

  
      return {message:"you have added this product to your favourites",like}
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to add this product to favourites',
          error.message,
        );
      }
    }
  }

  async removeProductfromFavourites(productID: number, user:UserEntity) {
    try {
      const like = await this.likesRepo.findOne({
        where: { product: { id: productID }, user: user },
        relations: ['product', 'user'],
      });
      if (!like) throw new NotFoundException('favourite product with id not found');

      await this.likesRepo.remove(like);

      await this.productRepo.save(like.product);

      return {message:"you have removed this product from your favourites"}

    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to unlike this product',
          error.message,
        );
      }
    }
  }

  async GetUserFavouriteProduct(user:UserEntity) {
    return await this.likesRepo.findAndCount({
      where: { user:user },
      relations: ['product'],
    });
  }

  //add product to cart
  async GuestAddToCart(productID: number, dto: AddToCartDto): Promise<ICart> {
    try {
      //check if the user has checked out before creating a new cart
      let cart = await this.cartRepo.findOne({
        where: { isCheckedOut: false },
        relations: ['items', 'items.product'],
      });
      if (!cart) {
        cart = this.cartRepo.create({ items: [] });
      }

      //check if product selected exists
      const product = await this.productRepo.findOne({
        where: { id: productID },
      });
      if (!product) throw new NotFoundException('product not found');


      // Check if the product has enough stock
      if (product.stock < dto.quantity) {
        throw new NotAcceptableException(
          'Not enough stock for the requested quantity',
        );
      }

      // Find the cart item if it already exists in the cart
      const cartItem = cart.items.find((item) => item.product.id === productID);

      //apply the wholesale logic
      let itemPrice = parseFloat(product.price.toString());
      if (dto.quantity >= (product.minWholesaleQuantity || 0)) {
        itemPrice = parseFloat(product.wholesalePrice?.toString() || product.price.toString());
      }

      if (cartItem) {
        // If the item is already in the cart, increase the quantity
        cartItem.quantity += dto.quantity;
      } else {
        // If the item is not in the cart, create a new cart item
        const newItem = this.cartItemRepo.create({
          product,
          quantity: dto.quantity,
          color: dto.color,
          sizes: dto.size,
          price: itemPrice,
          addedAT: new Date(),
        });
        cart.items.push(newItem);
      }

      // Decrease the product stock
      product.stock -= dto.quantity;
      await this.productRepo.save(product);

      await this.cartRepo.save(cart);
      return cart;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to add a product to cart, please try again later',error.message
        );
      }
    }
  }



  //increase cartitem quantity 
  async IncreaseCartItemQuantity(
    cartid:string,
    cartitemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    try {
   
      const cart = await this.cartRepo.findOne({
        where: { id:cartid, isCheckedOut: false },
        relations: ['items', 'items.product'],
      });
      if (!cart) throw new NotFoundException('Cart not found');

       // Check if the cart is already checked out
       if (cart.isCheckedOut)
        throw new BadRequestException('Cart has already been checked out');
      console.log('Cart is not checked out');

   
    // Find the cart item to increase the quantity of
    const cartItem = cart.items.find((item) => item.id === cartitemId);
    if (!cartItem) throw new NotFoundException('cart item not found');

    // Check if the product has enough stock
    const product = cartItem.product;
    if (!product) throw new NotFoundException('product not found');

    if (product.stock < dto.quantity) {
      throw new NotAcceptableException(
        'Not enough stock for the requested quantity',
      );
    }

    // Increase the quantity and update the total price
    cartItem.quantity += dto.quantity;
    //cartItem.price = (parseFloat(product.price.toString()) * cartItem.quantity);

    // Decrease the product stock
    product.stock -= dto.quantity;
    await this.productRepo.save(product);

    await this.cartRepo.save(cart);
    return cart;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof NotAcceptableException) {
        throw error;
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to update the cart item quantity, please try again later',
          error.message,
        );
      }
    }
  }



  //decrease carted item wuantity
  async DecreaseCartItemQuantity(
   
    cartid:string,
    cartitemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    try {
    
      // Find the user's cart
      const cart = await this.cartRepo.findOne({
        where: { id:cartid, isCheckedOut: false },
        relations: ['items', 'items.product'],
      });
      if (!cart) throw new NotFoundException('Cart not found');

       // Check if the cart is already checked out
       if (cart.isCheckedOut)
        throw new BadRequestException('Cart has already been checked out');
      console.log('Cart is not checked out');

   
    // Find the cart item to increase the quantity of
    const cartItem = cart.items.find((item) => item.id === cartitemId);
    if (!cartItem) throw new NotFoundException('cart item not found');

    // Check if the product has enough stock
    const product = cartItem.product;
    if (!product) throw new NotFoundException('product not found');

    if (product.stock < dto.quantity) {
      throw new NotAcceptableException(
        'Not enough stock for the requested quantity',
      );
    }

    // decrease the quantity and update the total price
    cartItem.quantity -= dto.quantity;
    //cartItem.price = (parseFloat(product.price.toString()) * cartItem.quantity);

    // increase the product stock
    product.stock += dto.quantity;
    await this.productRepo.save(product);

    await this.cartRepo.save(cart);
    return cart;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof NotAcceptableException) {
        throw error;
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to update the cart item quantity, please try again later',
          error.message,
        );
      }
    }
  }






  // Remove product from cart
  async GuestRemoveItemFromCart(
    cartId: string,
    cartItemId: string,
  ): Promise<ICart> {
    try {
      // Check if the user has a cart
      const cart = await this.cartRepo.findOne({
        where: { id: cartId },
        relations: ['items', 'items.product'],
      });
      if (!cart) throw new NotFoundException('cart not found');

      // Check if the cart is already checked out
      if (cart.isCheckedOut)
        throw new BadRequestException('Cart has already been checked out');
      console.log('Cart is not checked out');

      // Find the cart item to remove
      const cartItemIndex = cart.items.findIndex(
        (item) => item.id === cartItemId,
      );
      if (cartItemIndex === -1)
        throw new NotFoundException('cart item not found');

      //remove the cart item
      const removeCarttem = cart.items.splice(cartItemIndex, 1)[0];

      //increase the product stock
      const product = removeCarttem.product;
      if (product) {
        product.stock += removeCarttem.quantity;
        await this.productRepo.save(product);
      }

      await this.cartRepo.save(cart);
      return cart;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to remove a product from cart, please try again later',error.message
        );
      }
    }
  }

  async getCart(cartId:string): Promise<ICart> {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id:cartId, isCheckedOut: false },
        relations: ['user', 'items','items.product'],
      });
      if (!cart) throw new NotFoundException('cart not found');
      return cart;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch cart, please try again later',error.message
        );
      }
    }
  }


  async checkoutCart(cartID: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id: cartID },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      cart.isCheckedOut = true;
      await this.cartRepo.save(cart);

      // Call the order creation service
      const order = await this.orderservice.GuestCreateOrderFromCart(cart.id);

      return {
        message:
          'Checkout successful. Order has been created, proceed to confirm order and select payment method.',
        order,
      };
    } catch (error) {
      console.log('Error during checkout:', error);
      throw new InternalServerErrorException(
        error.message
      );
    }
  }

  //guest user confirm order

  async confirmGuestUserOrder(
    dto: confirmOrderDto,
    orderID: string,
  ) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID, isPaid: false },
        relations: ['items'],
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
        if (coupon.expires_in <= new Date() || coupon.isExpired === true) {
          throw new NotAcceptableException(
            'sorry the coupon code provided is already expired',
          );
        }
  
        // Apply the discount if promo code is valid
        order.discount = coupon.percentageOff;
        order.IsCouponCodeApplied = true;
        const totalWithDiscount = (Number(order.subTotal) * Number(order.discount)) / 100;
        order.total = Number(order.subTotal) - Number(totalWithDiscount);
      } else {
        // If no promo code is provided, use the original total
        order.total = Number(order.subTotal) + Number(order.shippinFee);
      }
  
      // Continue the order
      order.orderType = dto.orderType;
  
      // Handle payment methods
      const payment = await this.paymentservice.PaymentService(order);

      if (payment){
        await this.shiprocketservice.recommendDispatchService(order)
      }
     
  
      order.paymentMethod = payment;
      order.name = dto.name;
      order.mobile = dto.mobile;
      order.billing_address = dto.billing_address;
      order.email = dto.email;
  
      await this.orderRepo.save(order);
  
      // Send mail to user
      await this.mailer.OrderAcceptedMail(
        order.email,
        order.name,
        order.trackingID,
        order.orderID,
      );
  
      return {message:'the order has been successfully made, thanks for your patronage',order};
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to confirm an order, please try again later', error.message
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
          'something went wrong while tracking an order, please try again later',error.message
        );
      }
    }
  }


  // subscribe for newsletter
  async SubsribeToNewsLetter(dto: NewsLetterDto) {
    try {
      const emailExists = await this.newsletterripo.findOne({
        where: { email: dto.email },
      });
      if (emailExists)
        throw new ConflictException(
          'user with email address already subscribed, please use another email address'
        );

      //subscribe
      const newSubscriber = new NewsLetterEntity();
      newSubscriber.email = dto.email;
      newSubscriber.SubscribedAt = new Date();

      await this.newsletterripo.save(newSubscriber);

      //notifiction
      const notification = new Notifications();
      notification.account = dto.email;
      notification.subject = 'News Letter Subscription!';
      notification.message = `the user with email ${newSubscriber.email} have subscribed to the baby n' stuff newsletter `;
      await this.notficationrepo.save(notification);

      return {
        message: 'you have successully subscribed to our news letter',
      };
    } catch (error) {
      if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while subscribing for news letter, please try again later',error.message
        );
      }
    }
  }

  //leave a feedback after the order
  async FeedBack(dto: FedbackDto) {
    try {
      //provide feedback
      const feedback = new FeddbackEntity();
      feedback.email = dto.email;
      feedback.shoppingExperience = dto.shoppingExperience,
      feedback.additionalFeedback = dto.additionalFeedBack
      feedback.feedbackGivenAT = new Date();

      await this.feedbackripo.save(feedback);

      //notifiction
      const notification = new Notifications();
      notification.account = dto.email;
      notification.subject = 'News feedback Given!';
      notification.message = `the user with email ${feedback.email} have given a feedback to the baby n' stuff newsletter `;
      await this.notficationrepo.save(notification);

      return {
        message: 'you have successully given a feedback',
      };
    } catch (error) {
      if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while subscribing for news letter, please try again later',error.message
        );
      }
    }
  }
}

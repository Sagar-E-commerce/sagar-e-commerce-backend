import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity, CartItemEntity } from 'src/Entity/cart.entity';
import {
  CartItemRepository,
  CartRepository,
  UserRepository,
} from '../user.repository';
import { IProduct, ProductEntity } from 'src/Entity/products.entity';
import { ProductRepository } from 'src/common/common.repositories';
import { UserEntity } from 'src/Entity/users.entity';
import { AddToCartDto, UpdateCartItemDto, confirmOrderDto } from '../dto/otherDto';
import { PaymentGatewaysService } from '../payment/payement-gatways.service';
import { OrderService } from '../order/order.service';
import { ICart } from './cart';
import { Between, Like } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepository,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: CartItemRepository,
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    private paymentservice: PaymentGatewaysService,
    private orderservice: OrderService,
  ) {}

  //add product to cart
  async AddToCart(
    user: UserEntity,
    productID: number,
    dto: AddToCartDto,
  ): Promise<ICart> {
    try {
     

      //check if the user has checked out before creating a new cart
      let cart = await this.cartRepo.findOne({
        where: { user:{id:user.id}, isCheckedOut: false },
        relations: ['user','items', 'items.product'],
      });

      if (cart) {
        console.log(`existing cart found:`,cart)
      }
      else {
        
        cart = new CartEntity()
        cart.items = [],
        cart.user = user;
        await this.cartRepo.save(cart)

        console.log('new cart', cart)
      }

      //check if product selected exists
      const product = await this.productRepo.findOne({
        where: { id: productID },
      });
      if (!product) throw new NotFoundException('product not found');
      console.log('product',product)


      // Check if the product has enough stock
      if (product.stock < dto.quantity) {
        throw new NotAcceptableException(
          'Not enough stock for the requested quantity',
        );
      }

      // Find the cart item if it already exists in the cart
      const cartItem = cart.items.find((item) => item.product.id === productID);
      // Apply wholesale pricing logic
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
          product:product,
          quantity: dto.quantity,
          color: dto.color,
          sizes: dto.size,
          price: itemPrice,
          addedAT: new Date(),
        });
        cart.items.push(newItem);
        console.log('newitem',newItem)
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
    user: UserEntity,
    cartitemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    try {
     
      // Find the user's cart
      const cart = await this.cartRepo.findOne({
        where: { user:{id:user.id}, isCheckedOut: false },
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
    user: UserEntity,
    cartitemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    try {
    
      // Find the user's cart
      const cart = await this.cartRepo.findOne({
        where: { user:{id:user.id}, isCheckedOut: false },
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
  async RemoveFromCart(user: UserEntity, cartItemId: string): Promise<ICart> {
    try {
      

      // Check if the user has a cart
      const cart = await this.cartRepo.findOne({
        where: { user: {id:user.id} },
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

  //get cart
  async getCart(user: UserEntity): Promise<ICart & { itemCount: number }> {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: user.id }, isCheckedOut: false },
        relations: ['user', 'items', 'items.product'],
      });
      if (!cart) throw new NotFoundException('Cart not found');
  
     
         // Calculate the number of unique items in the cart
    const itemCount = cart.items.length;
  
      // Return the cart along with the item count
      return { ...cart, itemCount };
    } catch (error) {
      if (error instanceof NotFoundException) throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to fetch cart, please try again later',
          error.message,
        );
      }
    }
  }
  

  async checkoutCart(user: UserEntity) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user:{id:user.id} },
        relations: ['items', 'user', 'items.product'],
      });

      if (!cart) {
        console.log('Cart not found for user:', user.id);
        throw new NotFoundException('Cart not found');
      }

      console.log('Cart found:', cart);
      cart.isCheckedOut = true;
      await this.cartRepo.save(cart);

      console.log('Cart checked out and saved:', cart);

      // Call the order creation service
      const order = await this.orderservice.CreateOrderFromCart(user);
      console.log('Order created from cart:', order);

      //clear the cart and reset the checkout 
      cart.isCheckedOut = false;
      cart.items= [],
      await this.cartRepo.save(cart)

      return {
        message:
          'Checkout successful. Order has been created, proceed to confirm order and select payment method.',
        order,
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw new InternalServerErrorException(
        'Something went wrong while trying to check out, please try again later',error.message
      );
    }
  }


 
}

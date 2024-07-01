import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
import { Notifications } from 'src/Entity/notifications.entity';
import { IProduct, ProductEntity } from 'src/Entity/products.entity';
import { ProductAvailability } from 'src/Enums/all-enums';
import { ThresholdDto, stockDto } from 'src/admin/dto/otherDto';
import {
  NotificationRepository,
  ProductRepository,
} from 'src/common/common.repositories';
import { LessThan } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
  ) {}

  //restock
  async RestockProduct(dto: stockDto, productID: number): Promise<IProduct> {
    try {
      const product = await this.productRepo.findOne({
        where: { id: productID,  },relations:['category']
      });
      if (!product)
        throw new NotFoundException(`product with id ${productID} not found`);

      product.stock += dto.quantity;
      product.restockedAT = new Date();

      if (product.stock > 0) {
        product.availability = ProductAvailability.IN_STOCK;
        product.isOutOfStock = false;
      } else {
        product.availability = ProductAvailability.OUT_OF_STOCK;
        product.isOutOfStock = true;
      }

      await this.productRepo.save(product);

      //notifiction
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product Restocked!';
      notification.message = `the Admin have retocked a product on baby n' stuff `;
      await this.notficationrepo.save(notification);
      return product;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somehting went wrong while trying to restock a product, please try again later',error.message,
        );
      }
    }
  }

  //adjuststock
  async AdjustProductStock(
    dto: stockDto,
    productID: number,
  ): Promise<IProduct> {
    try {
      const product = await this.productRepo.findOne({
        where: { id: productID },relations:['category']
      });
      if (!product)
        throw new NotFoundException(`product with id ${productID} not found`);

      product.stock -= dto.quantity;
      product.stockAdjustedAT = new Date();

      if (product.stock > 0) {
        product.availability = ProductAvailability.IN_STOCK;
        product.isOutOfStock = false;
      } else {
        product.availability = ProductAvailability.OUT_OF_STOCK;
        product.isOutOfStock = true;
      }

      await this.productRepo.save(product);

      //notifiction
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product stock  Adjusted!';
      notification.message = `the Admin have adjusted a product stock on baby n' stuff `;
      await this.notficationrepo.save(notification);
      return product;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somehting went wrong while trying to adjust the stock of a product, please try again later',error.message,
        );
      }
    }
  }

  //fetchlostocks
  async getLowStockProducts(threshold: number) {
    try {
        const figure = await this.productRepo.findAndCount({
          where: { stock: LessThan(threshold) },
          relations:['category']

        });
        if (figure[1]===0) throw new NotFoundException(`at the moment, there are no product stocks in the database that has less than ${threshold} stock quantities, maybe try a higher stock figure`)

        return figure
    } catch (error) {

        console.log(error);
        if (error instanceof NotFoundException) throw new NotFoundException(error.message) 
        else{
      console.log(error)
        throw new InternalServerErrorException(
          'somehting went wrong while trying to get the stock of product with low treshold, please try again later',error.message
        );
        }

        
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'dns';
import { OrderEntity } from 'src/Entity/order.entity';
import { ProductEntity } from 'src/Entity/products.entity';
import { UserEntity } from 'src/Entity/users.entity';
import {
  AverageOrderValueDto,
  CustomerRetentionDto,
  RevenueDto,
  SalesPerformanceDto,
  deliveryspeedDto,
  newUserDto,
  salesTrendDto,
  userLifetimeValueDto,
  userfeedbackDto,
} from 'src/admin/dto/analytics.dto';
import { ProductRepository } from 'src/common/common.repositories';
import { OrderRepository, UserRepository } from 'src/user/user.repository';
import internal from 'stream';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
  ) {}

  async getProductSalesPerformance(): Promise<SalesPerformanceDto[]> {
    try {
      const salesData = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'item')
        .leftJoinAndSelect('item.product', 'product')
        .select('product.id', 'productID')
        .addSelect('product.name', 'productName')
        .addSelect('SUM(item.quantity)', 'totalSales')
        .addSelect('SUM(item.price * item.quantity)', 'totalRevenue') // Ensure this line has the correct alias
        .groupBy('product.id')
        .addGroupBy('product.name')
        .getRawMany();
  
      return salesData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  

  //get best performing product
  async getBestPerformingProduct(): Promise<SalesPerformanceDto> {
    try {
      const salesData = await this.getProductSalesPerformance();
      return salesData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTotalRevenueOverTime(): Promise<RevenueDto[]> {
    try {
      const revenueData = await this.orderRepo
        .createQueryBuilder('order')
        .select('DATE_TRUNC(\'day\', order.createdAT)', 'date') // Use DATE_TRUNC to group by day
        .addSelect('SUM(order.total)', 'totalRevenue')
        .groupBy('DATE_TRUNC(\'day\', order.createdAT)')
        .orderBy('DATE_TRUNC(\'day\', order.createdAT)', 'ASC') // Use the same expression in ORDER BY
        .getRawMany();
  
      return revenueData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  

  async getNewUsersOvertime(): Promise<newUserDto[]> {
    try {
      const userData = await this.userRepo
        .createQueryBuilder('user')
        .select('DATE_TRUNC(\'day\', user.RegisteredAt)', 'date')
        .addSelect('COUNT(user.id)', 'newUsers')
        .groupBy('DATE_TRUNC(\'day\', user.RegisteredAt)')
        .orderBy('date', 'ASC')
        .getRawMany();
  
      return userData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }


  //get deliveryspeed
  async getDeliveryspeed(): Promise<deliveryspeedDto[]> {
    try {
      const deliveryData = await this.orderRepo
        .createQueryBuilder('order')
        .select('order.id', 'orderID')
        .addSelect(
          'TIMESTAMPDIFF(HOUR, order.createdAt, order.deliveredAt)',
          'deliveryTime',
        )
        .where('order.status = :status', { status: 'delivered' })
        .getRawMany();

      return deliveryData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //get sales trend
  async salesTrends(): Promise<salesTrendDto[]> {
    try {
      const salestrendData = await this.orderRepo
        .createQueryBuilder('order')
        .select('DATE_TRUNC(\'day\', order.createdAT)', 'date')
        .addSelect('SUM(order.total)', 'totalRevenue')
        .addSelect('COUNT(order.id)', 'totalSales')
        .groupBy('DATE_TRUNC(\'day\', order.createdAT)')
        .orderBy('date', 'ASC')
        .getRawMany();
  
      return salestrendData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  
  //get customer retention rate

  async getuserRetentionRate(): Promise<CustomerRetentionDto[]> {
    try {
      const retentionData = await this.userRepo
        .createQueryBuilder('user')
        .select('DATE(user.RegisteredAt)', 'date')
        .addSelect('COUNT(user.id)', 'newUsers')
        .addSelect('COUNT(DISTINCT user.id)', 'retainedUsers')
        .groupBy('DATE(user.RegisteredAt)')
        .orderBy('date')
        .getRawMany();

      //calculate retention rate
      const result = retentionData.map((data) => ({
        date: data.date,
        retentionRate: (data.retainedUsers / data.newUsers) * 100,
      }));
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //average order value
  async getaverageOrderValue(): Promise<AverageOrderValueDto[]> {
    try {
      const aovData = await this.orderRepo
        .createQueryBuilder('order')
        .select('DATE(order.createdAT)', 'date')
        .addSelect('AVG(order.total)', 'averageOrderValue')
        .groupBy('date')
        .getRawMany();

      return aovData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //get customer live time value

  async getcustomerLifetimeValue(): Promise<userLifetimeValueDto[]> {
    try {
      const clvData = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.orders', 'order')
        .select('user.id', 'userID')
        .addSelect('SUM(order.total)', 'lifetimeValue')
        .groupBy('user.id')
        .getRawMany();

      return clvData;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //get customer feddback

  async getCustomerFeedBack(): Promise<userfeedbackDto[]> {
    try {
      const feedback = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.reviews', 'review')
        .select('product.id', 'productID')
        .addSelect('AVG(reviews.rating)', 'averageRating')
        .addSelect('COUNT(reviews.id', 'totalReviews')
        .groupBy('product.id')
        .getRawMany();

      return feedback.map((data) => ({
        productID: parseInt(data.productID),
        averageRating: parseFloat(data.averageRating),
        totalReviews: parseInt(data.totalReviews),
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderRepository } from 'src/user/user.repository';

@Injectable()
export class ShiprocketService {
  private readonly shiprocketApiBaseUrl = 'https://api/v2.shiprocket.in/v1/external';
  private readonly email = process.env.shiprocke_email;
  private readonly password = process.env.shiprocket_password

  constructor(@InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,){}
 

  private async getAuthToken(): Promise<string> {
    const payload = {
      email: this.email,
      password: this.password,
    };

    try {
      const response = await axios.post(`${this.shiprocketApiBaseUrl}/auth/login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.token;
    } catch (error) {
      throw new InternalServerErrorException('Failed to authenticate with Shiprocket', error.message);
    }
  }

  async recommendDispatchService(orderDetails: OrderEntity): Promise<any> {
    const token = await this.getAuthToken();

    const order = await this.orderRepo.findOne({
        where: { id:orderDetails.id,  isPaid: true },
        relations: ['user', 'items'],
      });
      if (!order) throw new NotFoundException('order not found');


    const payload = {
      pickup_postcode: order.pickuppincode,
      delivery_postcode: order.dropoffpincode,
      cod: 0, // Assuming no cash on delivery
      weight: order.weight,
    };

    try {
      const response = await axios.post(`${this.shiprocketApiBaseUrl}/courier/serviceability/`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to recommend dispatch service', error.message);
    }
  }
}

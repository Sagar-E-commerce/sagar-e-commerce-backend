import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { OrderEntity } from 'src/Entity/order.entity';
import { OrderRepository } from 'src/user/user.repository';
import * as crypto from 'crypto';
import { ORDERTYPE, OrderStatus } from 'src/Enums/all-enums';
import { ReccommendDispatchDto } from '../common.dto';
import { ShiprocketApiException, ShiprocketException, ShiprocketNetworkException } from '../helpers/shiprocket.error';

@Injectable()
export class ShiprocketService {
  private readonly shiprocketApiBaseUrl =
    'https://apiv2.shiprocket.in/v1/external';
  private readonly email = 'nedufari@gmail.com';
  private readonly password = '98654449Jossy@';

  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
  ) {}

  private async getAuthToken(): Promise<string> {
    const payload = {
      email: this.email,
      password: this.password,
    };

    try {
      const response = await axios.post(
        `${this.shiprocketApiBaseUrl}/auth/login`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.token;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to authenticate with Shiprocket',
        error.message,
      );
    }
  }

  async getChannels(): Promise<any> {
    const url = 'https://apiv2.shiprocket.in/v1/external/channels';
    const token = await this.getAuthToken();
  
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch channels: ${error.message}`);
    }
  }



  

  async getAvailableCouriers(pickupPincode: string, dropoffPincode: string, weight: number, orderValue: number): Promise<any[]> {
    const url = 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/';
    const token = await this.getAuthToken();
  
    const params = {
      pickup_postcode: pickupPincode,
      delivery_postcode: dropoffPincode,
      weight,
      cod: 0,
      order_value: orderValue,
    };
  
    console.log('Requesting available couriers with params:', params); // Log the request parameters
  
    try {
      const response = await axios.get(url, {
        params: params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response from Shiprocket:', response.data); // Log the response
      return response.data.data.available_courier_companies;
    } catch (error) {
      console.error('Error response from Shiprocket:', error.response.data); // Log the error response
      throw new Error(`Failed to get available couriers: ${error.message}`);
    }
  }

  




 
  async createShipment(shipmentData: any): Promise<any> {
    try {
      const token = await this.getAuthToken();
      const response = await axios.post(
        `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`,
        shipmentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token})}`,
          },
        }
      );

      if (response.data.status === 1) {
        return {
          shipment_id: response.data.shipment_id,
          awb_code: response.data.awb_code,
          order_id: response.data.order_id,
        };
      } else {
        throw new Error(response.data.message || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Error creating shipment:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Token might be expired, try refreshing it
        await this.getAuthToken();
        // Retry the request
        return this.createShipment(shipmentData);
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to create shipment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

 
  
  
async requestPickup(order: OrderEntity): Promise<any> {
  const url = 'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup';
  const token = await this.getAuthToken();

  const data = {
    shipment_id: [order.shipmentID],
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to request pickup: ${error.message}`);
  }
}
  
 
  

  //webhook
  async handleShiprocketWebhook(req: Request, res: Response): Promise<void> {
    const secret = 'thegearmates';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const expectedSignature = shasum.digest('hex');
    const receivedSignature = req.headers['x-shiprocket-signature'] as string;

    if (receivedSignature !== expectedSignature) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;
    const orderId = event.data.order_id;  // Assuming this field contains the order ID

    const order = await this.orderRepo.findOne({
      where: { orderID: orderId },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    switch (event.event) {
      case 'shipment.created':
        order.status = OrderStatus.SHIPPED;
        break;
      case 'shipment.picked_up':
        order.status = OrderStatus.SHIPPED;
        break;
      case 'shipment.delivered':
        order.status = OrderStatus.DELIVERED;
        break;
      default:
        res.sendStatus(200);
        return;
    }

    await this.orderRepo.save(order);
    res.sendStatus(200);
  }
}

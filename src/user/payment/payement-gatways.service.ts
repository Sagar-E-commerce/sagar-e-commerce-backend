import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/Entity/cart.entity';
import { CartRepository, OrderRepository } from '../user.repository';
import axios from 'axios';
import { Notifications } from 'src/Entity/notifications.entity';
import { NotificationRepository } from 'src/common/common.repositories';
import { OrderEntity } from 'src/Entity/order.entity';
import { CashfreePaymentGatewayService } from 'src/admin/dashboard/payment-config/cashfree.service';
import { RazorPayPaymentGatewayService } from 'src/admin/dashboard/payment-config/razorpay.service';
import { PayUmoneyPaymentGatewayService } from 'src/admin/dashboard/payment-config/payumoney.service';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentGatewaysService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(Notifications)
    private readonly notificationRepo: NotificationRepository,
    @InjectRepository(PaymentConfigurationEntity)
    private readonly paymentGatewayConfigRepo: Repository<PaymentConfigurationEntity>,
    private cashfreepaymentservice:CashfreePaymentGatewayService,
    private razorpaypaymentservice:RazorPayPaymentGatewayService,
    private payumoneyservice:PayUmoneyPaymentGatewayService
  ) {}

  async getConfig(): Promise<PaymentConfigurationEntity> {
    const config = await this.paymentGatewayConfigRepo.findOne({});
    if (!config)
      throw new NotFoundException('Payment gateway config not found');
    return config;
  }

  async PaymentService(orderDetails: OrderEntity): Promise<any> {
    const config = await this.getConfig();

    switch (config.selectedGateway) {
      case 'cashfree':
        return this.cashfreepaymentservice.createPaymentCashfree(orderDetails);
      case 'razorpay':
        return this.razorpaypaymentservice.createPaymentRazorpay(orderDetails);
      case 'payUmoney':
        return this.payumoneyservice.createPaymentPayUMoney(orderDetails);
      default:
        throw new InternalServerErrorException('No payment gateway selected');
    }


  }

}

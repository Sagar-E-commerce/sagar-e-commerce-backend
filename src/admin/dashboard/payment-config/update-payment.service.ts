import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import { UpdatePaymentGatewayDto } from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UpdatePaymentGatewayConfigService {
  constructor(
    @InjectRepository(PaymentConfigurationEntity)
    private readonly paymentGatewayConfigRepo: Repository<PaymentConfigurationEntity>,
  ) {}

  async getConfig(): Promise<PaymentConfigurationEntity[]> {
    try {
      const config = await this.paymentGatewayConfigRepo.find();
      if (!config)
        throw new NotFoundException('Payment gateway config not found');
      return config;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while fetching the payment gateway configuration',
          error.message,
        );
      }
      
    }
  }

  async firstclicktoSelectPaymentGateway(
    dto: UpdatePaymentGatewayDto,
  ): Promise<PaymentConfigurationEntity> {
    try {
      const gateway = new PaymentConfigurationEntity();
      gateway.selectedGateway = dto.selectedGateway;
      gateway.updatedAt = new Date();
      await this.paymentGatewayConfigRepo.save(gateway);
      return gateway;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while coniguring the payment gateway',
        error.message,
      );
    }
  }

  // Method to update selected gateway
  async updateSelectedGateway(
    dto: UpdatePaymentGatewayDto,
    id: number,
  ): Promise<PaymentConfigurationEntity> {
    try {
      let config = await this.paymentGatewayConfigRepo.findOne({
        where: { id: id },
      });
      if (!config) {
        throw new NotFoundException('Payment gateway config not found');
      }
      config.selectedGateway = dto.selectedGateway;
      return await this.paymentGatewayConfigRepo.save(config);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while update the payment gateway configuration',
          error.message,
        );
      }
    }
  }
}

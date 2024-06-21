import { Injectable, NotFoundException } from '@nestjs/common';
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
    const config = await this.paymentGatewayConfigRepo.find();
    if (!config)
      throw new NotFoundException('Payment gateway config not found');
    return config;
  }

  // Method to update selected gateway
  async updateSelectedGateway(
    dto: UpdatePaymentGatewayDto,
    id: number,
  ): Promise<PaymentConfigurationEntity> {
    let config = await this.paymentGatewayConfigRepo.findOne({
      where: { id: id },
    });
    if (!config) {
      throw new NotFoundException('Payment gateway config not found');
    }
    config.selectedGateway = dto.selectedGateway;
    return await this.paymentGatewayConfigRepo.save(config);
  }
}

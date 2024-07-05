import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasscodeEntity } from 'src/Entity/passcodes.entity';
import { PaymentConfigurationEntity } from 'src/Entity/paymentConfig.entity';
import { PassCodeRepository } from 'src/admin/admin.repository';
import { UpdatePaymentGatewayDto } from 'src/admin/dto/payment-config.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UpdatePaymentGatewayConfigService {
  constructor(
    @InjectRepository(PaymentConfigurationEntity)
    private readonly paymentGatewayConfigRepo: Repository<PaymentConfigurationEntity>,
    @InjectRepository(PasscodeEntity)
    private readonly passcodeRipo: PassCodeRepository,
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
      const passcode = await this.passcodeRipo.findOne({
        where: { passcode: dto.passcode },
      });
      if (!passcode) throw new NotFoundException('passcode incorrect');

      const gateway = new PaymentConfigurationEntity();
      gateway.selectedGateway = dto.selectedGateway;
      gateway.updatedAt = new Date();
      await this.paymentGatewayConfigRepo.save(gateway);

      return gateway;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while selecting the payment gateway',
          error.message,
        );
      }
    }
  }

  // Method to update selected gateway
  async updateSelectedGateway(
    dto: UpdatePaymentGatewayDto,
    id: number,
  ): Promise<PaymentConfigurationEntity> {
    try {

      const passcode = await this.passcodeRipo.findOne({
        where: { passcode: dto.passcode },
      });
      if (!passcode) throw new NotFoundException('passcode incorrect');


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

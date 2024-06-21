import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaymentGateways } from 'src/Enums/all-enums';

export class UpdatePaymentGatewayDto {
  @IsOptional()
  @IsEnum(PaymentGateways)
  selectedGateway?: PaymentGateways;

}

//ooption for one kind of p

// export class UpdatePaymentGatewayDto2 {
//     @IsOptional()
//     @ValidateNested()
//     @Type(() => RazorpayConfigDto)
//     razorpay?: RazorpayConfigDto;
  
//     @IsOptional()
//     @ValidateNested()
//     @Type(() => PayUMoneyConfigDto)
//     payumoney?: PayUMoneyConfigDto;
  
//     @IsOptional()
//     @ValidateNested()
//     @Type(() => CashfreeConfigDto)
//     cashfree?: CashfreeConfigDto;
//   }


export class RazorpayConfigDto {
    @IsString()
    razorpayKeyId: string;
  
    @IsString()
    razorpayKeySecret: string;
  
    @IsString()
    razorpayWebhookSecret: string;

    @IsString()
    razorpayApiSecret: string;

    @IsString()
    razorpayApiKey: string;
  }


  export class PayUMoneyConfigDto {
    @IsString()
    payuMerchantKey: string;
  
    @IsString()
    payuMerchantSalt: string;
  
    @IsString()
    payuWebhookSalt: string;

    @IsString()
    payumoneyMerchantId: string;

    @IsString()
    payumoneyApiKey: string;

    @IsString()
    payumoneyApiSecret: string;

    @IsString()
    payumoneyAuthToken:string

    @IsString()
    payumoneyPaymentUrl:string
  

  }


  export class CashfreeConfigDto {
    @IsString()
    cashfreeAppId: string;
  
    @IsString()
    cashfreeSecretKey: string;
  
    @IsString()
    cashfreeWebhookSecret: string;

    @IsString()
    cashfreeClientId:string

    @IsString()
    cashfreeClientSecret:string

    @IsString()
    cashfreePaymentUrl:string

    @IsString()
    cashfreeApiSecret: string;

  }


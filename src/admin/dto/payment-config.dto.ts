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

  export class UpdateRazorpayConfigDto {
    @IsString()
    @IsOptional()
    razorpayKeyId: string;
  
    @IsString()
    @IsOptional()
    razorpayKeySecret: string;
  
    @IsString()
    @IsOptional()
    razorpayWebhookSecret: string;

    @IsString()
    @IsOptional()
    razorpayApiSecret: string;

    @IsString()
    @IsOptional()
    razorpayApiKey: string;
  }


  export class PayUMoneyConfigDto {
    @IsString()
    payuMerchantKey: string;
  
    @IsString()
    payuMerchantSalt: string;
  
    @IsString()
    payuWebhookSecret: string;

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

  export class UpdatePayUMoneyConfigDto {
    @IsString()
    @IsOptional()
    payuMerchantKey: string;
  
    @IsString()
    @IsOptional()
    payuMerchantSalt: string;
  
    @IsString()
    @IsOptional()
    payuWebhookSalt: string;

    @IsString()
    @IsOptional()
    payumoneyMerchantId: string;

    @IsString()
    @IsOptional()
    payumoneyApiKey: string;

    @IsString()
    @IsOptional()
    payumoneyApiSecret: string;

    @IsString()
    @IsOptional()
    payumoneyAuthToken:string

    @IsString()
    @IsOptional()
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

    @IsString()
    cashfreeApiKey:string

  }


  export class UpdateCashfreeConfigDto {
    @IsString()
    @IsOptional()
    cashfreeAppId: string;
  
    @IsString()
    @IsOptional()
    cashfreeSecretKey: string;
  
    @IsString()
    @IsOptional()
    cashfreeWebhookSecret: string;

    @IsString()
    @IsOptional()
    cashfreeClientId:string

    @IsString()
    @IsOptional()
    cashfreeClientSecret:string

    @IsString()
    @IsOptional()
    cashfreePaymentUrl:string

    @IsString()
    @IsOptional()
    cashfreeApiSecret: string;

    @IsString()
    @IsOptional()
    cashfreeApiKey:string

  }


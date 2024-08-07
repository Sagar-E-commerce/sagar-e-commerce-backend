import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CategoryProductAvailabilitySatisfaction, LikelihoodOfWebsiteReccomendation, ORDERTYPE, OrderType, ProductAndImageDiscription, ProductBrowsingExperience, ShoppingExperience, paymentType } from "src/Enums/all-enums";

export class EditUserProfileDto{
    @IsString()
    @IsOptional()
    fullname: string;

    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @IsOptional()
    Nationality: string

    @IsString()
    @IsOptional()
    home_address:string
    
    @IsString()
    @IsOptional()
    mobile:string

    @IsString()
    @IsOptional()
    gender: string

    @IsString()
    @IsOptional()
    LGA_of_Home_Address: string

    @IsString()
    @IsOptional()
    cityOfResidence:string
}

export class AddToCartDto {
  
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;

    @IsString()
    @IsOptional()
    size:string

    @IsString()
    @IsOptional()
    color:string
  }

  export class UpdateCartItemDto {
    @IsInt()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
  }

  export class CourierDto{
    @IsNumber()
    courierID:number
  }

  export class confirmOrderDto{
    @IsOptional()
    @IsEnum(ORDERTYPE)
    orderType:ORDERTYPE

    @IsOptional()
    @IsString()
    promoCode:string


    @IsString()
    @IsOptional()
    name:string

    @IsString()
    @IsOptional()
    mobile:string

    @IsString()
    @IsOptional()
    billing_address:string

    @IsString()
    @IsOptional()
    billing_address_2:string

    @IsEmail()
    @IsOptional()
    email:string


    @IsString()
    @IsOptional()
    billing_city:string

    @IsString()
    @IsOptional()
    billing_state:string

    @IsString()
    @IsOptional()
    billing_pincode:string

   

  }

  export class NewsLetterDto{

    @IsString()
    @IsNotEmpty()
    email:string
  }

  export class FedbackDto{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsEnum(ShoppingExperience)
    @IsNotEmpty()
    shoppingExperience:ShoppingExperience


    @IsString()
    @IsOptional()
    additionalFeedBack:string
    
  }

  export class ConverterDto{
    @IsNumber()
    @IsNotEmpty()
    amount:number

    @IsString()
    @IsNotEmpty()
    fromCurrency:string

    @IsString()
    @IsNotEmpty()
    toCurrency: string
  }


export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  gateway: string; // E.g., 'cashfree', 'razorpay', 'payumoney'

  

  // Other necessary fields...
}

  

  

  
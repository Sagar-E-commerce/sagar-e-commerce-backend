import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CategoryProductAvailabilitySatisfaction, LikelihoodOfWebsiteReccomendation, OrderType, ProductAndImageDiscription, ProductBrowsingExperience, ShoppingExperience, paymentType } from "src/Enums/all-enums";

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

  export class confirmOrderDto{
    @IsNotEmpty()
    @IsEnum(OrderType)
    orderType:OrderType

    @IsOptional()
    @IsString()
    promoCode:string

    @IsNotEmpty()
    @IsEnum(paymentType)
    paymentMethod:paymentType

    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsNotEmpty()
    mobile:string

    @IsString()
    @IsNotEmpty()
    billing_address:string

    @IsEmail()
    @IsNotEmpty()
    email:string
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

    @IsEnum(ProductBrowsingExperience)
    @IsNotEmpty()
    productBrowsingExperience:ProductBrowsingExperience

    @IsEnum(ProductAndImageDiscription)
    @IsNotEmpty()
    productImageDescription:ProductAndImageDiscription

    @IsEnum(CategoryProductAvailabilitySatisfaction)
    @IsNotEmpty()
    categoryProductAvailability:CategoryProductAvailabilitySatisfaction

    @IsEnum(LikelihoodOfWebsiteReccomendation)
    @IsNotEmpty()
    likelihoodofWebsiteReccomendation:LikelihoodOfWebsiteReccomendation

    @IsString()
    @IsOptional()
    additionalSatisfactionOrFeedBack:string

    
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
  

  

  
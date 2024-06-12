import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { AdminAccessLevels, AdminType, OrderStatus, ProductAvailability } from "src/Enums/all-enums";


export class EditAdminProfileDto{
    @IsString()
    @IsOptional()
    fisrtname: string;

    @IsString()
    @IsOptional()
    lastname: string;


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

   

}

export class AdminchangeOtherAdminAccessLevelDto{
    @IsEnum(AdminAccessLevels)
    accesslevel:AdminAccessLevels
}

export class AdminChangeOtherAdminTypeDto{
    @IsEnum(AdminType)
    admintype:AdminType
}


export class CreateProductDto{
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    price:number

    @IsOptional()
    @IsArray()
    productImages:string[]


    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value,10))
    stock:number


    @IsNotEmpty()
    @IsString()
    description:string

    @IsNotEmpty()
    @IsString()
    name:string

    @IsArray()
    @IsString()
    @IsOptional()
    available_sizes:string[]

    @IsArray()
    @IsString()
    @IsOptional()
    available_colors:string[]


    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    wholesalePrice:number

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value,10))
    minWholesaleQuantity:number


    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value,10))
    categoryId: number;

    @IsOptional()
    @IsBoolean()
    hasTax?:boolean

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    taxRate?:number
}

export class UpdateProductDto{
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    price:number

    @IsOptional()
    @IsArray()
    productImages:string[]


    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value,10))
    stock:number


    @IsOptional()
    @IsString()
    description:string

    @IsOptional()
    @IsString()
    name:string


    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    wholesalePrice:number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value,10))
    minWholesaleQuantity:number


    @IsOptional()
    @IsNumber()
    categoryId: number;


    @IsOptional()
    @IsBoolean()
    hasTax?:boolean

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    taxRate?:number
}

export class updateOrderStatusDto{
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status:OrderStatus
}

export class uploadVideoDto{
    @IsString()
    @IsOptional()
    @MaxLength(300)
    description:string

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value,10))
    productID:number
    
}

export class CreateCategoryDto{

    @IsNotEmpty()
    @IsString()
    name:string

    @IsOptional()
    @IsString()
    description:string

}

export class UpdateCategoryDto{

    @IsOptional()
    @IsString()
    name:string

    @IsOptional()
    @IsString()
    description:string

}

export class flatRateDto{
    @IsNumber()
    @IsNotEmpty()
    flatRate:number

    @IsString()
    @IsOptional()
    currency:string



}

export class EditflatRateDto{
    @IsNumber()
    @IsNotEmpty()
    flatRate:number

    @IsString()
    @IsOptional()
    currency:string

}

export class DiscountDto{
    @IsString()
    @IsNotEmpty()
    discountCode:string

    @IsNumber()
    @IsOptional()
    DiscountDuration_weeks:number

    @IsNumber()
    @IsOptional()
    DiscountDuration_days:number


    @IsNumber()
    @IsOptional()
    percentageOff:number
}


export class UpdateDiscountDto{
    @IsString()
    @IsOptional()
    discountCode:string

    @IsNumber()
    @IsOptional()
    DiscountDuration_weeks:number

    @IsNumber()
    @IsOptional()
    DiscountDuration_days:number


    @IsNumber()
    @IsOptional()
    percentageOff:number
}

export class stockDto{
    @IsNumber()
    @IsNotEmpty()
    quantity:number

}

export class ThresholdDto{
    @IsNotEmpty()
    @IsNumber()
    threshold:number
}


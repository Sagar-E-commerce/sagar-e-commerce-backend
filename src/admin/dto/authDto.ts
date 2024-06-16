import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator"
import { AdminAccessLevels, AdminType } from "src/Enums/all-enums"
import { Match } from "src/common/helpers/match.decorator"

export class RegisterAdminDto{
    @IsEmail()
    @IsNotEmpty()
    email:string


    @IsString()
    @IsNotEmpty()
    fullname:string

    @IsString()
    @IsNotEmpty()
    mobile:string

    @IsString()
    @IsOptional()
    Nationality:string



    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password :string

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the password.' })
    confirmPassword:string 

  


}

export class RegisterOtherAdminDto{
    @IsEmail()
    @IsNotEmpty()
    email:string


    @IsString()
    @IsNotEmpty()
    fullname:string

    @IsString()
    @IsNotEmpty()
    mobile:string

    @IsString()
    @IsOptional()
    Nationality:string


    @IsEnum(AdminType)
    @IsNotEmpty()
    adminType:AdminType

    @IsEnum(AdminAccessLevels)
    @IsNotEmpty()
    accesslevel:AdminAccessLevels

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password :string

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the password.' })
    confirmPassword:string 


}
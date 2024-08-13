import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { Match } from "./helpers/match.decorator";

export class VerifyOtpDto{
    
    @IsString()
    @IsNotEmpty()
    otp:string
}

export class SendPasswordResetLinkDto{
    
    @IsString()
    @IsNotEmpty()
    email:string 

}

export class  VerifyOtpForResetPasswordDto{
    

    @IsString()
    @IsNotEmpty()
    otp:string  

}

export class ReccommendDispatchDto{
    pickuppincode:string
    dropoffpincode:string
    weight:number 
    
}


export class addPasswordDto{

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password:string 

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the new password.' })
    confirmPassword:string 

    @IsEmail()
    @IsNotEmpty()
    email:string
    


}

export class Logindto{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    password:string
}

export class ChangePasswordDto{

    @IsString()
    @IsNotEmpty()
    oldPassword:string

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password:string 

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the new password.' })
    confirmPassword:string 

}

export class confirmDeleteAccountDto{
    @IsString()
    @IsNotEmpty()
    password:string 
}
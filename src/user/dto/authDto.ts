import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { Match } from "src/common/helpers/match.decorator"

export class RegisterUserDto{
    @IsEmail()
    @IsNotEmpty()
    email:string


    @IsString()
    @IsNotEmpty()
    mobile:string

    @IsString()
    @IsNotEmpty()
    fullname:string

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
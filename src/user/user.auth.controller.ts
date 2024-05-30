import { Controller, Req, Get, Post, Patch, Body,UseGuards } from '@nestjs/common';
import { UserAuthService } from './user.auth.service';
import { RegisterUserDto } from './dto/authDto';
import {
  Logindto,
  SendPasswordResetLinkDto,
  VerifyOtpDto,
  VerifyOtpForResetPasswordDto,
  addPasswordDto,
} from 'src/common/common.dto';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userauthservice: UserAuthService) {}

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<any> {
    const userId = req.user.id;
    return this.userauthservice.getProfile(userId);
  }

  @Post('/register')
  async Registeradmin(
    @Body() dto: RegisterUserDto,
  ): Promise<{ message: string }> {
    return await this.userauthservice.RegisterUser(dto);
  }

  @Post('/verify-email')
  async Verify_email(
    @Body() dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any }> {
    return await this.userauthservice.verifyEmail(dto);
  }

  @Post('/resend-otp')
  async resendVerificationLink(
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const email = req.headers.email;
    console.log(email);
    return await this.userauthservice.ResendExpiredOtp(email);
  }

  @Post('/send-password-reset-token')
  async sendPasswordResetLink(
    @Body() dto: SendPasswordResetLinkDto,
  ): Promise<{ message: string }> {
    return await this.userauthservice.sendPasswordResetLink(dto);
  }

  @Post('/verify-reset-password-token')
  async VerifyResetPasswordToken(
    @Body() dto: VerifyOtpForResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.userauthservice.VerifyResetPasswordOtp(dto);
  }

  @Patch('/reset-password')
  async ResetPassword(
    @Req() req: Request,
    @Body() dto: addPasswordDto,
  ): Promise<{ message: string }> {
    const adminID = req.headers.id;
    return await this.userauthservice.FinallyResetPasswordAfterVerification(
      adminID,
      dto,
    );
  }

  @Post('/login')
  async Login(@Body() dto: Logindto) {
    return await this.userauthservice.login(dto);
  }
}

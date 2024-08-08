import { Body, Controller, Post, Req, Get, Patch,UseGuards } from '@nestjs/common';
import {
  Logindto,
  SendPasswordResetLinkDto,
  VerifyOtpDto,
  VerifyOtpForResetPasswordDto,
  addPasswordDto,
} from 'src/common/common.dto';
import { RegisterAdminDto } from './dto/authDto';
import { AdminAuthService } from './admin.auth.service';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { PasscodeDto } from './dto/otherDto';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminauthservice: AdminAuthService) {}

  @Post('generate-passcode')
  async GeneratePasscode() {
    return await this.adminauthservice.GeneratePasscode();
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.adminauthservice.getProfile(req.user);
  }

  @Post('/verify-passcode')
  async VerifyPasscode(
    @Body() dto: PasscodeDto,
  ){
    return await this.adminauthservice.VerifyPasscodeBeforeSignup(dto);
  }

  @Post('/register')
  async Registeradmin(
    @Body() dto: RegisterAdminDto,
  ): Promise<{ message: string }> {
    return await this.adminauthservice.RegisterAdmin(dto);
  }

  @Post('/verify-email')
  async Verify_email(
    @Body() dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any }> {
    return await this.adminauthservice.verifyEmail(dto);
  }

  @Post('/resend-otp')
  async resendVerificationLink(
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const email = req.headers.email;
    console.log(email);
    return await this.adminauthservice.ResendExpiredOtp(email);
  }

  @Post('/send-password-reset-token')
  async sendPasswordResetLink(
    @Body() dto: SendPasswordResetLinkDto,
  ): Promise<{ message: string }> {
    return await this.adminauthservice.sendPasswordResetLink(dto);
  }

  @Post('/verify-reset-password-token')
  async VerifyResetPasswordToken(
    @Body() dto: VerifyOtpForResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.adminauthservice.VerifyResetPasswordOtp(dto);
  }

  @Patch('/reset-password')
  async ResetPassword(
    @Req() req: Request,
    @Body() dto: addPasswordDto,
  ): Promise<{ message: string }> {
    const adminID = req.headers.id;
    return await this.adminauthservice.FinallyResetPasswordAfterVerification(
      adminID,
      dto,
    );
  }

  @Post('/login')
  async Login(@Body() dto: Logindto) {
    return await this.adminauthservice.login(dto);
  }
}

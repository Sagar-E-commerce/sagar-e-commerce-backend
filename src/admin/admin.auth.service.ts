import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/Entity/admin.entity';
import { AdminRepository, PassCodeRepository } from './admin.repository';
import { GeneatorService } from 'src/common/services/generator.service';
import { IAdmin } from './admin';
import { AdminAccessLevels, AdminType } from 'src/Enums/all-enums';
import { RegisterAdminDto } from './dto/authDto';
import { UserOtp } from 'src/Entity/otp.entity';
import {
  NotificationRepository,
  OtpRepository,
} from 'src/common/common.repositories';
import { Notifications } from 'src/Entity/notifications.entity';
import { Mailer } from 'src/common/mailer/mailer.service';
import {
  Logindto,
  SendPasswordResetLinkDto,
  VerifyOtpDto,
  VerifyOtpForResetPasswordDto,
  addPasswordDto,
} from 'src/common/common.dto';
import { LessThan } from 'typeorm';
import { PasscodeEntity } from 'src/Entity/passcodes.entity';
import { PasscodeDto } from './dto/otherDto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminRepo: AdminRepository,
    @InjectRepository(UserOtp) private readonly otprepo: OtpRepository,
    @InjectRepository(Notifications)
    private readonly notificationrepo: NotificationRepository,
    @InjectRepository(PasscodeEntity)
    private readonly passcodeRipo: PassCodeRepository,
    private generatorservice: GeneatorService,
    private mailerservice: Mailer,
  ) {}

  async GeneratePasscode() {
    try {
      const code = await this.generatorservice.generatePassCode();
      //const hashcode = await this.generatorservice.hashpassword(code);

      const newcode = new PasscodeEntity();
      newcode.passcode = code;
      newcode.updatedAT = new Date();
      await this.passcodeRipo.save(newcode);

      return { message: 'new pass code generated', code };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong when creating the passcode',
        error.message,
      );
    }
  }


  //verify the passcode
  async VerifyPasscodeBeforeSignup(dto: PasscodeDto) {
    try {
      const passcode = await this.passcodeRipo.findOne({
        where: { passcode: dto.passcode },
      });
      if (!passcode)
        throw new NotFoundException(
          'passcode incorrect, please provide a valid passcode. Thank you',
        );

      return {
        message: 'passcode correct, please proceed to sign up as a superAdmin',passcode
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong, please try again later',
          error.message,
        );
      }
    }
  }

  // get admin profile
  async getProfile(Admin: AdminEntity): Promise<IAdmin> {
    try {
      const admin = await this.adminRepo.findOne({ where: { id: Admin.id } });
      if (!admin) {
        throw new NotFoundException('admin not found');
      }
      return admin;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while fetching admin profile, please try again later',
          error.message,
        );
      }
    }
  }

  //sign up admin

  async RegisterAdmin(dto: RegisterAdminDto): Promise<{ message: string }> {
    try {
      const checkemail = await this.adminRepo.findOne({
        where: { email: dto.email },
      });
      if (checkemail) throw new ConflictException('This admin already exists');

      const hashedpassword = await this.generatorservice.hashpassword(
        dto.password,
      );

      const admin = new AdminEntity();
      admin.adminID = `#BASA-${await this.generatorservice.generateUserID()}`;
      admin.email = dto.email;
      admin.mobile = dto.mobile;
      admin.fullname = dto.fullname;
      admin.password = hashedpassword;
      admin.adminaccessLevel = AdminAccessLevels.LEVEL3;
      admin.admintype = AdminType.SUPERADMIN;
      admin.Nationality = dto.Nationality;
      admin.RegisteredAt = new Date();
      admin.isRegistered = true;

      await this.adminRepo.save(admin);

      //2fa authentication
      const emiailverificationcode =
        await this.generatorservice.generateEmailToken();

      //otp
      const otp = new UserOtp();
      otp.email = dto.email;
      otp.otp = emiailverificationcode;
      otp.role = admin.role;
      const twominuteslater = new Date();
      await twominuteslater.setMinutes(twominuteslater.getMinutes() + 2);
      otp.expiration_time = twominuteslater;
      await this.otprepo.save(otp);

      // mail
      await this.mailerservice.SendVerificationeMail(
        dto.email,
        dto.fullname,
        emiailverificationcode,
        twominuteslater,
      );

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'SuperAdmin Created!';
      notification.message = `new SuperAdmin created successfully `;
      await this.notificationrepo.save(notification);

      return {
        message:
          'You have successfully being registered as a SuperAdmin,please check your email for the otp verification',
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something happen while trying to sign up as an admin',
          error.message,
        );
      }
    }
  }

  //verify email address 2fa
  async verifyEmail(
    dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any; admin: IAdmin }> {
    try {
      //find the otp provided if it matches with the otp stored
      const findotp = await this.otprepo.findOne({ where: { otp: dto.otp } });
      if (!findotp)
        throw new NotFoundException(
          'you provided an invalid OTP,please go back to your email and confirm the OTP sent to you',
        );

      //find if the otp is expired
      if (findotp.expiration_time <= new Date())
        throw new RequestTimeoutException(
          'OTP is expired, please request for another one',
        );

      // Find the admin associated with the OTP
      const admin = await this.adminRepo.findOne({
        where: { email: findotp.email },
      });
      if (!admin)
        throw new NotFoundException('No admin found for the provided OTP.');

      // Verify and update the customer's status
      admin.isVerified = true;
      admin.isLoggedIn = true;
      await this.adminRepo.save(admin);

      const notification = new Notifications();
      (notification.account = admin.id),
        (notification.subject = ' Admin Verified!');
      notification.message = `Hello ${admin.fullname}, your email has been successfully verified `;
      await this.notificationrepo.save(notification);

      await this.adminRepo.save(admin);

      //send welcome mail
      await this.mailerservice.WelcomeMailAdmin(admin.email, admin.fullname);

      const accessToken = await this.generatorservice.signToken(
        admin.id,
        admin.email,
        admin.role,
      );

      return { isValid: true, accessToken, admin: admin };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof RequestTimeoutException)
        throw new RequestTimeoutException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'an error occured while verifying the email of the admin pls try again',
          error.message,
        );
      }
    }
  }

  // resend email verification otp
  async ResendExpiredOtp(email: string | any): Promise<{ message: string }> {
    try {
      const emailexsist = await this.adminRepo.findOne({
        where: { email: email },
      });
      if (!emailexsist)
        throw new ConflictException(
          `customer with email: ${email}doesn't exists, please use an already registered email`,
        );

      // Check if there is an expired OTP for the user
      const expiredOtp = await this.otprepo.findOne({
        where: { email: email, expiration_time: LessThan(new Date()) },
      });
      if (!expiredOtp) {
        throw new NotFoundException('No expired OTP found for this user.');
      }
      // Generate a new OTP
      const emiailverificationcode =
        await this.generatorservice.generateEmailToken(); // Your OTP generated tokens

      // Save the token with expiration time
      const twominuteslater = new Date();
      await twominuteslater.setMinutes(twominuteslater.getMinutes() + 2);

      //save the token
      const newOtp = this.otprepo.create({
        email: email,
        otp: emiailverificationcode,
        expiration_time: twominuteslater,
        role: emailexsist.role,
      });
      await this.otprepo.save(newOtp);

      //save the notification
      const notification = new Notifications();
      notification.account = emailexsist.id;
      notification.subject = 'Otp Resent!';
      notification.message = `Hello ${emailexsist.fullname}, a new verification Link has been resent to your mail `;
      await this.notificationrepo.save(notification);

      //send mail
      await this.mailerservice.SendVerificationeMail(
        newOtp.email,
        emailexsist.fullname,
        emiailverificationcode,
        twominuteslater,
      );

      return {
        message: 'New Otp verification code has been sent successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong when trying to resend otp, please try again',
          error.message,
        );
      }
    }
  }

  //request for password reset link
  async sendPasswordResetLink(
    dto: SendPasswordResetLinkDto,
  ): Promise<{ message: string }> {
    try {
      const isEmailRegistered = await this.adminRepo.findOne({
        where: { email: dto.email },
      });
      if (!isEmailRegistered)
        throw new NotFoundException(
          `this email ${dto.email} does not exist in our system, please try another email address`,
        );

      const resetlink = await this.generatorservice.generateEmailToken();
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);

      //send reset link to the email provided
      await this.mailerservice.SendPasswordResetLinkMail(
        dto.email,
        resetlink,
        isEmailRegistered.fullname,
      );

      //save the reset link and the expiration time to the database
      isEmailRegistered.password_reset_link = resetlink;
      isEmailRegistered.reset_link_exptime = expirationTime;
      await this.adminRepo.save(isEmailRegistered);

      const notification = new Notifications();
      (notification.account = isEmailRegistered.id),
        (notification.subject = 'password Reset link!');
      notification.message = `Hello ${isEmailRegistered.fullname}, password resent link sent `;
      await this.notificationrepo.save(notification);

      return { message: 'The password reset link has been sent successfully' };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong when trying to request for password reset link, please try again',
          error.message,
        );
      }
    }
  }

  //verify token sent when trying to reset password
  async VerifyResetPasswordOtp(
    dto: VerifyOtpForResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      //find the user who has the reset otp sent
      const verifyuser = await this.adminRepo.findOne({
        where: { password_reset_link: dto.otp },
      });
      if (!verifyuser)
        throw new NotAcceptableException(
          'the reset password token is incorrect please retry or request for another token',
        );

      //find if the otp is expired
      if (verifyuser.reset_link_exptime <= new Date())
        throw new RequestTimeoutException(
          'reset token is expired, please request for another one',
        );

      const notification = new Notifications();
      (notification.account = verifyuser.id),
        (notification.subject = 'Verify Password Reset Token!');
      notification.message = `Hello ${verifyuser.fullname}, password reset link verified, please proceed to resetting your password `;
      await this.adminRepo.save(verifyuser);

      return { message: 'password reset OTP has been verified' };
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else if (error instanceof RequestTimeoutException)
        throw new RequestTimeoutException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong when trying to verify reset link sent , please try again',
          error.message,
        );
      }
    }
  }

  //reset password
  async FinallyResetPasswordAfterVerification(
  
    dto: addPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const checkcustomer = await this.adminRepo.findOne({
        where: { email:dto.email },
      });
      if (!checkcustomer.isVerified)
        throw new UnauthorizedException(
          'sorry this admin has not been verified yet, please request for an otp to verify your account',
        );

      const hashedpassword = await this.generatorservice.hashpassword(
        dto.password,
      );

      //add the password
      checkcustomer.password = hashedpassword;

      await this.adminRepo.save(checkcustomer);

      return { message: 'password has been reset successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException)
        throw new UnauthorizedException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong when trying to reset password , please try again',
          error.message,
        );
      }
    }
  }

  //login
  async login(logindto: Logindto) {
    try {
      const findadmin = await this.adminRepo.findOne({
        where: { email: logindto.email },
      });
      if (!findadmin) throw new NotFoundException(`invalid credential`);

      const comparepass = await this.generatorservice.comaprePassword(
        logindto.password,
        findadmin.password,
      );
      if (!comparepass) throw new NotFoundException('invalid credential');

      //admin must be verified before gaining access
      if (!findadmin.isVerified)
        throw new ForbiddenException(
          `Your account has not been verified. Please verify your account by requesting a verification code.`,
        );

      //If the password matches
      findadmin.isLoggedIn = true;
      await this.adminRepo.save(findadmin);

      //save the notification
      const notification = new Notifications();
      notification.account = findadmin.id;
      notification.subject = ' login!';
      notification.message = `Hello ${findadmin.fullname}, just logged in `;
      await this.notificationrepo.save(notification);

      const token = await this.generatorservice.signToken(
        findadmin.id,
        findadmin.email,
        findadmin.role,
      );

      return { accesstoken: token, admin: findadmin };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ForbiddenException)
        throw new ForbiddenException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong when trying to login , please try again',
          error.message,
        );
      }
    }
  }
}

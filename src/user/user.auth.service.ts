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
import { GeneatorService } from 'src/common/services/generator.service';
import { AdminType } from 'src/Enums/all-enums';
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
import { UserEntity } from 'src/Entity/users.entity';
import { RegisterUserDto } from './dto/authDto';
import { UserRepository } from './user.repository';
import { IUser } from './user';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    @InjectRepository(UserOtp) private readonly otprepo: OtpRepository,
    @InjectRepository(Notifications)
    private readonly notificationrepo: NotificationRepository,
    private generatorservice: GeneatorService,
    private mailerservice: Mailer,
  ) {}

  // get admin profile
  async getProfile(User: UserEntity): Promise<IUser> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: User.id },
        relations: ['carts','carts.items', 'favourites','favourites.product','orders'],
      });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      return user;
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

  async RegisterUser(dto: RegisterUserDto): Promise<{ message: string }> {
    try {
      const checkemail = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (checkemail) throw new ConflictException('This user already exists');

      const hashedpassword = await this.generatorservice.hashpassword(
        dto.password,
      );

      const user = new UserEntity();
      user.userID = `#TgmU-${await this.generatorservice.generateUserID()}`;
      user.email = dto.email;
      user.fullname = dto.fullname;
      user.mobile = dto.mobile;
      user.password = hashedpassword;
      user.RegisteredAt = new Date();
      user.isRegistered = true;

      await this.userRepo.save(user);

      //2fa authentication
      const emiailverificationcode =
        await this.generatorservice.generateEmailToken();

      //otp
      const otp = new UserOtp();
      otp.email = dto.email;
      otp.otp = emiailverificationcode;
      otp.role = user.role;
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
      notification.account = user.id;
      notification.subject = 'User Created!';
      notification.message = `new user created successfully `;
      await this.notificationrepo.save(notification);

      return {
        message:
          'You have successfully registered as a user, please check your email for the otp verification',
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something happen while trying to sign up as a user',
          error.message,
        );
      }
    }
  }

  //verify email address 2fa
  async verifyEmail(
    dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any; user:IUser }> {
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

      // Find the user associated with the OTP
      const user = await this.userRepo.findOne({
        where: { email: findotp.email },
      });
      if (!user)
        throw new NotFoundException('No user found for the provided OTP.');

      // Verify and update the user's status
      user.isVerified = true;
      user.isLoggedIn = true;
      await this.userRepo.save(user);

      const notification = new Notifications();
      (notification.account = user.id),
        (notification.subject = ' User Verified!');
      notification.message = `Hello ${user.fullname}, your email has been successfully verified `;
      await this.notificationrepo.save(notification);

      await this.userRepo.save(user);

      //send welcome mail
      await this.mailerservice.WelcomeMail(user.email, user.fullname);

      const accessToken = await this.generatorservice.signToken(
        user.id,
        user.email,
        user.role,
      );

      return { isValid: true, accessToken, user:user };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof RequestTimeoutException)
        throw new RequestTimeoutException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'an error occured while verifying the email of the user, pls try again',
          error.message,
        );
      }
    }
  }

  // resend email verification otp
  async ResendExpiredOtp(email: string | any): Promise<{ message: string }> {
    try {
      const emailexsist = await this.userRepo.findOne({
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
      const isEmailRegistered = await this.userRepo.findOne({
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
      await this.userRepo.save(isEmailRegistered);

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
      const verifyuser = await this.userRepo.findOne({
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
      await this.userRepo.save(verifyuser);

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
      const checkuser = await this.userRepo.findOne({
        where: { email:dto.email },
      });
      if (!checkuser.isVerified)
        throw new UnauthorizedException(
          'sorry this user has not been verified yet, please request for an otp to verify your account',
        );

      const hashedpassword = await this.generatorservice.hashpassword(
        dto.password,
      );

      //add the password
      checkuser.password = hashedpassword;

      await this.userRepo.save(checkuser);

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
      const finduser = await this.userRepo.findOne({
        where: { email: logindto.email },
      });
      if (!finduser) throw new NotFoundException(`invalid credential`);

      const comparepass = await this.generatorservice.comaprePassword(
        logindto.password,
        finduser.password,
      );
      if (!comparepass) throw new NotFoundException('invalid credential');

      //admin must be verified before gaining access
      if (!finduser.isVerified)
        throw new ForbiddenException(
          `Your account has not been verified. Please verify your account by requesting a verification code.`,
        );

      //If the password matches
      finduser.isLoggedIn = true;
      await this.userRepo.save(finduser);

      //save the notification
      const notification = new Notifications();
      notification.account = finduser.id;
      notification.subject = ' login!';
      notification.message = `Hello ${finduser.fullname}, just logged in `;
      await this.notificationrepo.save(notification);

      const token = await this.generatorservice.signToken(
        finduser.id,
        finduser.email,
        finduser.role,
      );

      return{accesstoken:token, user:finduser}
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ForbiddenException)
        throw new ForbiddenException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'somethig went wrong while trying to login , please try again',
          error.message,
        );
      }
    }
  }
}

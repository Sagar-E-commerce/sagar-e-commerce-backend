import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { UserEntity } from 'src/Entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from 'src/common/common.repositories';
import { Notifications } from 'src/Entity/notifications.entity';
import { EditUserProfileDto } from '../dto/otherDto';
import { IUser } from '../user';
import { UploadService } from 'src/common/services/upload.service';
import {
  ChangePasswordDto,
  confirmDeleteAccountDto,
} from 'src/common/common.dto';
import { GeneatorService } from 'src/common/services/generator.service';
import { CloudinaryService } from 'src/common/services/claudinary.service';

@Injectable()
export class ProfileMgtServices {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
    private uploadservice: UploadService,
    private generatorservice: GeneatorService,
    private cloudinaryservice:CloudinaryService
  ) {}

  // edit user info
  async EditUserProfile(
    dto: EditUserProfileDto,
    user: UserEntity,
  ): Promise<IUser> {
    try {
      user.Nationality = dto.Nationality;
      user.cityOfResidence = dto.cityOfResidence;
      user.fullname = dto.fullname;
      user.home_address = dto.home_address;
      user.mobile = dto.mobile;
      user.Nationality = dto.Nationality;
      user.LGA_of_Home_Address = dto.LGA_of_Home_Address;
      user.email = dto.email;
      user.gender = dto.gender
      user.UpdatedAt = new Date();

      await this.userRepo.save(user);

      //save the notification
      const notification = new Notifications();
      notification.account = user.id;
      notification.subject = 'User Profile Updated!';
      notification.message = `User Profile of User with ${user.userID} have been updated successfully `;
      await this.notficationrepo.save(notification);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update user profile ',error.message
        );
      }
    }
  }

  // change password
  async changeUserPassword(
    dto: ChangePasswordDto,
    user: UserEntity,
  ): Promise<{ message: string }> {
    try {
      const { oldPassword, password, confirmPassword } = dto;

      const comparepass = await this.generatorservice.comaprePassword(
        dto.oldPassword,
        user.password,
      );
      if (!comparepass)
        throw new NotAcceptableException(
          'the old password provided does not match the existing passworod',
        );

      const hashpass = await this.generatorservice.hashpassword(dto.password);

      user.password = hashpass;

      await this.userRepo.save(user);

      //save the notification
      const notification = new Notifications();
      notification.account = user.id;
      notification.subject = 'User Changed Password!';
      notification.message = `the user with id ${user.id} have succesfully changed password `;
      await this.notficationrepo.save(notification);

      return { message: 'passwod chanaged successfully' };
    } catch (error) {
      if (error instanceof NotAcceptableException) {
        throw new NotAcceptableException(error.message);
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to change password. Please try again later.',error.message
        );
      }
    }
  }

  //  upload profile pics
  async UploadUserProfilePics(
    mediafile: Express.Multer.File,
    user: UserEntity,
  ): Promise<{ message: string }> {
    try {
      const display_pics = await this.cloudinaryservice.uploadFile(mediafile);
      const mediaurl = display_pics.secure_url

      //update the image url

      user.profile_picture = mediaurl;

      await this.userRepo.save(user);

      //save the notification
      const notification = new Notifications();
      notification.account = user.id;
      notification.subject = ' User Uploaded Profile Pics!';
      notification.message = `the user with id ${user.id} have uploaded a profile picture `;
      await this.notficationrepo.save(notification);

      return { message: 'your profile picture has been uploaded successully ' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during profile picture upload',error.message
      );
    }
  }

  // delete user accout
  async DeleteUserAccount(dto: confirmDeleteAccountDto, user: UserEntity) {
    try {
      //compare the provided password with the stored one
      const comparepass = await this.generatorservice.comaprePassword(
        dto.password,
        user.password,
      );
      if (!comparepass)
        throw new NotAcceptableException(
          'the password provided does not match the existing passworod',
        );

      //delete account
      await this.userRepo.remove(user);

      //save the notification
      const notification = new Notifications();
      notification.account = user.id;
      notification.subject = ' User Account Deleted!';
      notification.message = `the user with id ${user.id} have deleted and deactivated its account `;
      await this.notficationrepo.save(notification);

      return { message: 'account successfullt deleted' };
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to delete user account, please try again later',error.message
        );
      }
    }
  }

  // file complaint
}

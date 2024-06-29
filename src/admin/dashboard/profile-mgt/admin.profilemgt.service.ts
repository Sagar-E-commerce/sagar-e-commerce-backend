import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/Entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from 'src/common/common.repositories';
import { INotification, Notifications } from 'src/Entity/notifications.entity';
import { UploadService } from 'src/common/services/upload.service';
import {
  ChangePasswordDto,
  confirmDeleteAccountDto,
} from 'src/common/common.dto';
import { GeneatorService } from 'src/common/services/generator.service';
import { CloudinaryService } from 'src/common/services/claudinary.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { AdminEntity } from 'src/Entity/admin.entity';
import { IAuthGuard } from '@nestjs/passport';
import { IAdmin } from 'src/admin/admin';
import { EditAdminProfileDto } from 'src/admin/dto/otherDto';

@Injectable()
export class AdminProfileMgtServices {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminRepo: AdminRepository,
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
    private uploadservice: UploadService,
    private generatorservice: GeneatorService,
    private cloudinaryservice: CloudinaryService,
  ) {}

  // edit user info
  async EditAdminProfile(
    dto: EditAdminProfileDto,
    admin: AdminEntity,
  ): Promise<IAdmin> {
    try {
      admin.Nationality = dto.Nationality;
      admin.fullname = dto.firstname;
      admin.mobile = dto.mobile;
      admin.email = dto.email;
      admin.Nationality = dto.Nationality;
      admin.gender = dto.gender;
      admin.UpdatedAt = new Date();

      await this.adminRepo.save(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'User Profile Updated!';
      notification.message = `User Profile of User with ${admin.adminID} have been updated successfully `;
      await this.notficationrepo.save(notification);

      return admin;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update admin profile ',
          error.message,
        );
      }
    }
  }

  // change password
  async changeAdminPassword(
    dto: ChangePasswordDto,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    try {
      const { oldPassword, password, confirmPassword } = dto;

      const comparepass = await this.generatorservice.comaprePassword(
        dto.oldPassword,
        admin.password,
      );
      if (!comparepass)
        throw new NotAcceptableException(
          'the old password provided does not match the existing passworod',
        );

      const hashpass = await this.generatorservice.hashpassword(dto.password);

      admin.password = hashpass;

      await this.adminRepo.save(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'Admin Changed Password!';
      notification.message = `the admin with id ${admin.id} have succesfully changed password `;
      await this.notficationrepo.save(notification);

      return { message: 'passwod chanaged successfully' };
    } catch (error) {
      if (error instanceof NotAcceptableException) {
        throw new NotAcceptableException(error.message);
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'Something went wrong while trying to change password. Please try again later.',
          error.message,
        );
      }
    }
  }

  //  upload profile pics
  async UploadAdminProfilePics(
    mediafile: Express.Multer.File,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    try {
      const display_pics = await this.cloudinaryservice.uploadFile(mediafile);
      const mediaurl = display_pics.secure_url;

      //update the image url

      admin.profile_picture = mediaurl;

      await this.adminRepo.save(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = ' Admin Uploaded Profile Pics!';
      notification.message = `the admin with id ${admin.id} have uploaded a profile picture `;
      await this.notficationrepo.save(notification);

      return { message: 'your profile picture has been uploaded successully ' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during profile picture upload',
        error.message,
      );
    }
  }

  // delete user accout
  async DeleteUserAccount(dto: confirmDeleteAccountDto, admin: AdminEntity) {
    try {
      //compare the provided password with the stored one
      const comparepass = await this.generatorservice.comaprePassword(
        dto.password,
        admin.password,
      );
      if (!comparepass)
        throw new NotAcceptableException(
          'the password provided does not match the existing passworod',
        );

      //delete account
      await this.adminRepo.remove(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = ' Admin Account Deleted!';
      notification.message = `the admin with id ${admin.id} have deleted and deactivated its account `;
      await this.notficationrepo.save(notification);

      return { message: 'account successfullt deleted' };
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to delete admin account, please try again later',
          error.message,
        );
      }
    }
  }

  async fetchallNotifications(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const notification = await this.notficationrepo.findAndCount({
        skip: skip,
        take: limit,
      });
      if (notification[1] === 0)
        throw new NotFoundException('no notificaions avaialale at the moment');
      return notification;
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all notifications, please try again later',
          error.message,
        );
      }
    }
  }

  async deleteOneNotifications(notificationID: number) {
    try {
      const notification = await this.notficationrepo.findOne({
        where: { id: notificationID },
      });
      if (!notification) throw new NotFoundException('notification not found');

      await this.notficationrepo.remove(notification);
      return { message: 'notification deleted successfully' };
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all notifications, please try again later',
          error.message,
        );
      }
    }
  }
}

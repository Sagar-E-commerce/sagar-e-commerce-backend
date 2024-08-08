import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAccessLevels, AdminType, Role } from 'src/Enums/all-enums';

import { GeneatorService } from 'src/common/services/generator.service';
import { RegisterAdminDto, RegisterOtherAdminDto } from 'src/admin/dto/authDto';
import { AdminEntity } from 'src/Entity/admin.entity';
import { Notifications } from 'src/Entity/notifications.entity';
import { NotificationRepository } from 'src/common/common.repositories';
import {
  AdminRepository,
  PassCodeRepository,
} from 'src/admin/admin.repository';
import { IAdmin } from 'src/admin/admin';
import { ILike } from 'typeorm';
import {
  AdminChangeOtherAdminTypeDto,
  AdminchangeOtherAdminAccessLevelDto,
} from 'src/admin/dto/otherDto';
import { PasscodeEntity } from 'src/Entity/passcodes.entity';
import { Mailer } from 'src/common/mailer/mailer.service';

@Injectable()
export class AdminsMgtService {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminripo: AdminRepository,
    @InjectRepository(Notifications)
    private readonly notificationripo: NotificationRepository,
    @InjectRepository(PasscodeEntity)
    private readonly passcodeRipo: PassCodeRepository,
    private generatorservice: GeneatorService,
    private mailer:Mailer
  ) {}

  //admin register rider
  async RegisterOtherAdmin(
    dto: RegisterOtherAdminDto,
    admin: AdminEntity,
  ): Promise<{ message: string; response: IAdmin; loginCredential: string }> {
    try {
      //find if rider already exists
      const findadmin = await this.adminripo.findOne({
        where: { email: dto.email },
      });
      if (findadmin)
        throw new NotAcceptableException(
          `email: ${dto.email} already exists, please provide another one`,
        );

      const hashedpassword = await this.generatorservice.hashpassword(
        dto.password,
      );

      //register new admin
      const otherAdmin = new AdminEntity();
      (otherAdmin.fullname = dto.fullname), (otherAdmin.email = dto.email);
      otherAdmin.password = hashedpassword;
      otherAdmin.admintype = dto.adminType;
      otherAdmin.mobile = dto.mobile;
      otherAdmin.role = Role.ADMIN;
      otherAdmin.Nationality = dto.Nationality;
      otherAdmin.adminaccessLevel = dto.accesslevel;
      otherAdmin.RegisteredAt = new Date();
      otherAdmin.isActivated = true;
      otherAdmin.isRegistered = true;
      otherAdmin.isVerified = true;

      await this.adminripo.save(otherAdmin);

      //save notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'Admin Registered Other Admin!';
      notification.message = `a new admin have been created on sagar stores `;
      await this.notificationripo.save(notification);

      return {
        message: 'the admin have been Registered Successfuly',
        response: otherAdmin,
        loginCredential: `email: ${otherAdmin.email} \n password: ${dto.password}`,
      };
    } catch (error) {
      if (error instanceof NotAcceptableException)
        throw new NotAcceptableException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to register other admin, please try again later',
          error.message,
        );
      }
    }
  }

  //admin delete rider
  async AdminDeleteOtherAdmin(adminID: number, admin: AdminEntity) {
    try {
      const findotheradmin = await this.adminripo.findOne({
        where: { id: adminID, admintype: AdminType.OTHER_ADMIN },
      });
      if (!findotheradmin)
        throw new NotFoundException(
          `admin with id:${adminID} is not found in the sagar stores database`,
        );

      //remove rider from the platorm
      await this.adminripo.remove(findotheradmin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'Admin deleted !';
      notification.message = `the admin with id ${adminID}  has been deleted from the sagar stores database by superAdmin `;
      await this.notificationripo.save(notification);

      return {
        message: ` Admin deleted  by the SuperAdmin `,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to delete this Admin, please try again later',
          error.message,
        );
      }
    }
  }

  async GetAllOtherAdmins(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    try {
      //fetch staffs with pagination
      const staff = await this.adminripo.findAndCount({
        where: { admintype: AdminType.OTHER_ADMIN },
        order: { RegisteredAt: 'DESC' },
        take: limit,
        skip: skip,
      });

      if (staff[1] === 0)
        throw new NotFoundException(
          'you have no Admins registred at the moment',
        );
      return staff;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all admins, please try again later',
          error.message,
        );
      }
    }
  }

  //admin get one staff by id
  async GetOneAdminByID(adminID: number) {
    try {
      const staff = await this.adminripo.findOne({
        where: { id: adminID, admintype: AdminType.OTHER_ADMIN },
      });
      if (!staff)
        throw new NotFoundException(
          `admin with id:${adminID} is not found in the sagar stores database`,
        );
      return staff;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while tryig to get one admin by ID, please try again later',
          error.message,
        );
      }
    }
  }

  //admin search for an admin
  async SearchForOtherAdmin(keyword: string, page?:number, perPage?:number, sort?:string): Promise<{ data: AdminEntity[]; total: number }> {
    try {
      const qb = this.adminripo.createQueryBuilder('admin')

      qb.where('admin.fullname ILIKE :keyword',{keyword:`%${keyword}%`})
      qb.cache(false)


      if (sort) {
        const [sortField] = sort.split(',');
        qb.orderBy(`admin.${sortField}`, 'DESC');
      }

      if (page && perPage) {
        qb.skip((page - 1) * perPage).take(perPage);
      }

      const [admin, total] = await qb.getManyAndCount();

      if (!admin.length) {
        throw new NotFoundException(
          `No category found matching your search criteria for "${keyword}".`,
        );
      }
  
      return { data: admin, total };

      
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while tryig to search for an admin, please try again later',
          error.message,
        );
      }
    }
  }

  //admin change astaff access level
  async ChangeOtherAdminAccessLevel(
    adminID: number,
    dto: AdminchangeOtherAdminAccessLevelDto,
  ): Promise<{ message: string; response: IAdmin }> {
    try {
      const admin = await this.adminripo.findOne({
        where: { id: adminID },
      });
      if (!admin)
        throw new NotFoundException(
          `admin with id:${adminID} is not found in the sagar stores database`,
        );

      //change accesslevel
      admin.adminaccessLevel = dto.accesslevel;
      await this.adminripo.save(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'Admin accesslevel changed !';
      notification.message = `the admin with id ${adminID} accesslevel have been changed on the admin portal of sagar stores by SuperAdmin  `;
      await this.notificationripo.save(notification);

      return {
        message: 'admin accesslevel has been changed successfully',
        response: admin,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to change the accesslevel of this staff, please try again later',
          error.message,
        );
      }
    }
  }

  async ChangeAdminType(
    adminID: number,
    dto: AdminChangeOtherAdminTypeDto,
  ): Promise<{ message: string; response: IAdmin }> {
    try {
      const admin = await this.adminripo.findOne({
        where: { id: adminID },
      });
      if (!admin)
        throw new NotFoundException(
          `admin with id:${adminID} is not found in the sagar stores database`,
        );

      //change accesslevel
      admin.admintype = dto.admintype;
      await this.adminripo.save(admin);

      //save the notification
      const notification = new Notifications();
      notification.account = admin.id;
      notification.subject = 'AdminType changed !';
      notification.message = `the admin with id ${adminID} adminType have been changed on the admin portal of sagar stores by SuperAdmin  `;
      await this.notificationripo.save(notification);

      return {
        message: 'adminType has been changed successfully',
        response: admin,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to change the adminType of this staff, please try again later',
          error.message,
        );
      }
    }
  }

  async AdminCount(): Promise<number> {
    const staff = await this.adminripo.count({
      where: { admintype: AdminType.OTHER_ADMIN },
    });
    return staff;
  }

 
  async UpdatePasscode(admin: AdminEntity, id: number) {
    try {
      const findadmin = await this.adminripo.findOne({
        where: {
          id: admin.id,
          adminaccessLevel: AdminAccessLevels.LEVEL3,
          admintype: AdminType.SUPERADMIN,
        },
      });
      if (!findadmin)
        throw new NotFoundException('this super admin is not found');

      const findpasscode = await this.passcodeRipo.findOne({
        where: { id: id },
      });
      if (!findpasscode)
        throw new NotFoundException(
          `passcode associated to id ${id} is not found`,
        );

      const code = await this.generatorservice.generatePassCode();
      //const hashcode = await this.generatorservice.hashpassword(code);

      findpasscode.passcode = code;
      findpasscode.updatedAT = new Date();
      await this.passcodeRipo.save(findpasscode);

      //forward passcode to mail
      await this.mailer.updatePasscodeMail(admin.email,admin.fullname,code)


      return { message: 'pass code updated by the superadmin, please check your email for the new passcode' };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while updating passcode, please try again later',
          error.message,
        );
      }
    }
  }

  //deactivate admin's account
}

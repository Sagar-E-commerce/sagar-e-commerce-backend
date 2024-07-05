import {
  Controller,
  UploadedFile,
  UseInterceptors,
  Post,
  Get,
  Patch,
  Delete,
  BadRequestException,
  Query,
  InternalServerErrorException,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Multer } from 'multer';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AdminAccessLevels, AdminType, Role } from 'src/Enums/all-enums';
import { AdminTypeGuard } from 'src/auth/guard/admintype.guard';
import { AdminTypes } from 'src/auth/decorator/admintype.decorator';
import { AdminAcessLevelGuard } from 'src/auth/guard/accesslevel.guard';
import { AdminAccessLevel } from 'src/auth/decorator/accesslevel.decorator';
import { AdminsMgtService } from './admins.mgt.service';
import { RegisterAdminDto, RegisterOtherAdminDto } from 'src/admin/dto/authDto';
import {
  AdminChangeOtherAdminTypeDto,
  AdminchangeOtherAdminAccessLevelDto,
} from 'src/admin/dto/otherDto';

@UseGuards(
  JwtGuard,
  RoleGuard,
  AdminTypeGuard,
  AdminTypeGuard,
  AdminAcessLevelGuard,
)
@Roles(Role.ADMIN)
@AdminTypes(AdminType.SUPERADMIN, AdminType.OTHER_ADMIN)
@Controller('admins-mgt')
export class AdminMgtController {
  constructor(private readonly adminsmgtservice: AdminsMgtService) {}

  @AdminAccessLevel(AdminAccessLevels.LEVEL3, AdminAccessLevels.LEVEL2)
  @Post('/register')
  async AdminRegisterStaff(@Body() dto: RegisterOtherAdminDto, @Req() req) {
    return await this.adminsmgtservice.RegisterOtherAdmin(dto, req.user);
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3)
  @Delete('delete-other-admin/:adminID')
  async DeleteStaff(@Param('adminID') adminID: number, @Req() req) {
    return await this.adminsmgtservice.AdminDeleteOtherAdmin(adminID, req.user);
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3, AdminAccessLevels.LEVEL2)
  @Get('/all-other-admins')
  async GetAllStaffs(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.adminsmgtservice.GetAllOtherAdmins(page, limit);
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3, AdminAccessLevels.LEVEL2)
  @Get('/one-other-admin/:adminID')
  async GetOneStaff(@Param('adminID') adminID: number) {
    return await this.adminsmgtservice.GetOneAdminByID(adminID);
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3, AdminAccessLevels.LEVEL2)
  @Get('/search-other-admin')
  async SearchStaff(
    @Query('keyword') keyword: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('sort') sort?: string,) {
    return await this.adminsmgtservice.SearchForOtherAdmin(keyword,page,perPage,sort);
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3)
  @Patch('/change-other-admin-accesslevel/:adminID')
  async ChangeOtherAdminAccessLevel(
    @Param('adminID') adminID: number,
    @Body() dto: AdminchangeOtherAdminAccessLevelDto,
  ) {
    return await this.adminsmgtservice.ChangeOtherAdminAccessLevel(
      adminID,
      dto,
    );
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3)
  @Patch('/change-other-admin-admintype/:adminID')
  async ChangesOtherAdminAdmintype(
    @Param('adminID') adminID: number,
    @Body() dto: AdminChangeOtherAdminTypeDto,
  ) {
    return await this.adminsmgtservice.ChangeAdminType(adminID, dto);
  }

  @Get('staff-count')
  async Staffcount() {
    return await this.adminsmgtservice.AdminCount();
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3)
  @Post('generate-passcode')
  async GeneratePasscode() {
    return await this.adminsmgtservice.GeneratePasscode();
  }

  @AdminAccessLevel(AdminAccessLevels.LEVEL3)
  @Patch('update-passcode/:passcodeID')
  async UpdatePasscode(@Param('passcodeID') passcodeID: number, @Req() req) {
    return await this.adminsmgtservice.UpdatePasscode(req.user, passcodeID);
  }
}

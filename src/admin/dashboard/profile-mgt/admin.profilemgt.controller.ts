import {
    Body,
    Controller,
    Delete,
    Patch,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  
  import {
    ChangePasswordDto,
    confirmDeleteAccountDto,
  } from 'src/common/common.dto';
  import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { JwtGuard } from 'src/auth/guard/jwt.guard';
  import { RoleGuard } from 'src/auth/guard/role.guard';
  import { Roles } from 'src/auth/decorator/role.decorator';
  import { AdminAccessLevels, Role } from 'src/Enums/all-enums';
import { AdminProfileMgtServices } from './admin.profilemgt.service';
import { EditAdminProfileDto } from 'src/admin/dto/otherDto';
import { AdminAcessLevelGuard } from 'src/auth/guard/accesslevel.guard';
import { AdminAccessLevel } from 'src/auth/decorator/accesslevel.decorator';
  
  @UseGuards(JwtGuard, RoleGuard,AdminAcessLevelGuard)
  @Roles(Role.ADMIN)
  @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
  
  @Controller('admin-profile-mgt')
  export class AdminProfileMgtController {
    constructor(private readonly profilemgtservice: AdminProfileMgtServices) {}
  
    @Patch('edit-admin-profile')
    async EditAdminProfile(@Body() dto: EditAdminProfileDto, @Req() req) {
      return await this.profilemgtservice.EditAdminProfile(dto, req.user);
    }
  
    @Patch('change-admin-password')
    async ChangeAdminPassowrd(@Body() dto: ChangePasswordDto, @Req() req) {
      return await this.profilemgtservice.changeAdminPassword(dto, req.user);
    }
  
    @Patch('upload-profile-pics')
    @UseInterceptors(FileInterceptor('profilePics'))
    async UploadProfilePics(
      @UploadedFile() file: Express.Multer.File,
      @Req() req,
    ) {
      return await this.profilemgtservice.UploadAdminProfilePics(
        file,
        req.user,
      );
    }
  
    @Delete('delete-admin-account')
    async DeleteUserAccount(@Body() dto: confirmDeleteAccountDto, @Req() req) {
      return await this.profilemgtservice.DeleteUserAccount(dto, req.user);
    }
  }
  
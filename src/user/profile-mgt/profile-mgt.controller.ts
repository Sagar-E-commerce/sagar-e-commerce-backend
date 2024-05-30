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
import { ProfileMgtServices } from './profile-mgt.service';
import { EditUserProfileDto } from '../dto/otherDto';
import {
  ChangePasswordDto,
  confirmDeleteAccountDto,
} from 'src/common/common.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/Enums/all-enums';

@UseGuards(JwtGuard, RoleGuard)
@Roles(Role.USER)

@Controller('profile-mgt')
export class ProfileMgtController {
  constructor(private readonly profilemgtservice: ProfileMgtServices) {}

  @Patch('edit-user-profile')
  async EditUSerProfile(@Body() dto: EditUserProfileDto, @Req() req) {
    return await this.profilemgtservice.EditUserProfile(dto, req.user);
  }

  @Patch('change-user-password')
  async ChangeUserPassowrd(@Body() dto: ChangePasswordDto, @Req() req) {
    return await this.profilemgtservice.changeUserPassword(dto, req.user);
  }

  @Patch('upload-profile-pics')
  @UseInterceptors(FileInterceptor('profilePics'))
  async UploadProfilePics(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return await this.profilemgtservice.UploadUserProfilePics(
      file,
      req.user,
    );
  }

  @Delete('delete-user-account')
  async DeleteUserAccount(@Body() dto: confirmDeleteAccountDto, @Req() req) {
    return await this.profilemgtservice.DeleteUserAccount(dto, req.user);
  }
}

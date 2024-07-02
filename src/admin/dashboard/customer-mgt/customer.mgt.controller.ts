import { Controller, Delete, Get, Param, Query, UseGuards } from "@nestjs/common";
import { CustomerMgtService } from "./customer.mgt.service";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAccessLevels, AdminType, Role } from "src/Enums/all-enums";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";
import { AdminTypeGuard } from "src/auth/guard/admintype.guard";
import { AdminTypes } from "src/auth/decorator/admintype.decorator";


@UseGuards(JwtGuard, RoleGuard,AdminTypeGuard,AdminAcessLevelGuard)
@Roles(Role.ADMIN)
@AdminTypes(AdminType.SUPERADMIN, AdminType.OTHER_ADMIN)
@Controller('customer-mgt')
export class CustomerMgtController{
    constructor(private readonly cusomermgtservice:CustomerMgtService){}

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('all-users')
    async GetallUser(@Query('page')page:number, @Query('limit')limit:number){
        return await this.cusomermgtservice.getAllUsers(page, limit)
    }


    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('one-user/:userID')
    async GetOneUser(@Param('userID')userID:number){
        return await this.cusomermgtservice.getOneUser(userID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3)
    @Delete('delete-user/:userID')
    async DeleteOneUser(@Param('userID')userID:number){
        return await this.cusomermgtservice.deleteOneUser(userID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('search-user')
    async searchUsers(@Query('keyword')keyword:string | any){
        return await this.cusomermgtservice.searchUsers(keyword)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('all-subscribers')
    async AllNewsLetterSubscribers( @Query('limit')limit:number, @Query('page')page:number){
        return await this.cusomermgtservice.GetAllNewsLetterSubscribers(page,limit)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('all-feedbacks')
    async AllFeedbacks( @Query('limit')limit:number, @Query('page')page:number){
        return await this.cusomermgtservice.GetAllFeedbacks(page,limit)
    }

    @Get('customer-count')
    async CustomerCount(){
        return await this.cusomermgtservice.CustomerCount()
    }
}
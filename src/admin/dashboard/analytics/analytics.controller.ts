import { Controller, Get, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAccessLevels, Role } from "src/Enums/all-enums";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";

@UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard)
@Roles(Role.ADMIN)
@AdminAccessLevel(AdminAccessLevels.LEVEL3)

@Controller('analytics')
export class AnalyticsController{
    constructor(private readonly anaylticservice:AnalyticsService){}

    @Get('product-sales-performance')
    async getProductSalesPerformance(){
        return await this.anaylticservice.getProductSalesPerformance()
    }

    @Get('best-perfoming-product')
    async getbestPerformingProduct(){
        return await this.anaylticservice.getBestPerformingProduct()
    }

    @Get('total-revenue-overtime')
    async totalRevenueOvertime(){
        return await this.anaylticservice.getTotalRevenueOverTime()
    }

    @Get('new-users-overtime')
    async getnewUSerOvertime(){
        return await this.anaylticservice.getNewUsersOvertime()
    }

    @Get('delivery-speed')
    async getDeliverySpeed(){
        return await this.anaylticservice.getDeliveryspeed()
    }

    @Get('sales-trend')
    async salesTrend(){
        return await this.anaylticservice.salesTrends()
    }

    @Get('user-retention-rate')
    async getuserRetentionRate(){
        return await this.anaylticservice.getuserRetentionRate()
    }

    @Get('average-order-value')
    async averageOrderValue(){
        return await this.anaylticservice.getaverageOrderValue()
    }


    @Get('customer-lifetime-value')
    async customerLifetimeValue(){
        return await this.anaylticservice.getcustomerLifetimeValue()
    }


    @Get('user-feedback')
    async getuserfeedback(){
        return await this.anaylticservice.getCustomerFeedBack()
    }
}
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrderMgtService } from "./order.mgt.service";
import { DiscountDto, EditflatRateDto, UpdateDiscountDto, flatRateDto, updateOrderStatusDto } from "src/admin/dto/otherDto";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAccessLevels, Role } from "src/Enums/all-enums";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";

@UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard)
@Roles(Role.ADMIN)


@Controller('order-mgt')
export class OrderMgtcontroller{
    constructor(private ordermgtservice:OrderMgtService){}

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-all-orders')
    async GetAllOrders(@Query('page')page:number, @Query('limit')limit:number){
        return await this.ordermgtservice.GetAllOrder(page,limit)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-all-delivered-orders')
    async GetAllDeliveredOrders(@Query('page')page:number, @Query('limit')limit:number){
        return await this.ordermgtservice.GetAllOrderDelivered(page,limit)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-all-processing-orders')
    async GetAllProcessingOrders(@Query('page')page:number, @Query('limit')limit:number){
        return await this.ordermgtservice.GetAllOrderProcessing(page,limit)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-all-shipped-orders')
    async GetAllShippedOrders(@Query('page')page:number, @Query('limit')limit:number){
        return await this.ordermgtservice.GetAllOrderShipped(page,limit)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-one-order/:orderID')
    async GetOneOrder(@Param('orderID')orderID:string){
        return await this.ordermgtservice.GetOneOrder(orderID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('track-order')
    async TrackOrder(@Query('keyword')keyword:string|any){
        return await this.ordermgtservice.TrackOrder(keyword)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Patch('update-order-status/:orderID')
    async UpdateOrderStatus(@Body()dto:updateOrderStatusDto,@Param('orderID')orderID:string){
        return await this.ordermgtservice.UpdateOrderStatus(dto,orderID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2)
    @Post('set-discount-Coupon')
    async setDiscountCouponcode(@Body()dto:DiscountDto){
        return await this.ordermgtservice.SetDiscountAndDuration(dto)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2)
    @Patch('update-discount-Coupon/:discountID')
    async UpdateDiscountCouponcode(@Body()dto:UpdateDiscountDto,@Param('discountID')discountID:number){
        return await this.ordermgtservice.Updatediscount(dto,discountID)
    }


    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,)
    @Delete('delete-discount-Coupon/:discountID')
    async DeleteDiscountCouponcode(@Param('discountID')discountID:number){
        return await this.ordermgtservice.deleteDiscount(discountID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-coupons')
    async GetCoupons(){
        return await this.ordermgtservice.GetCoupons()
    }


    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2)
    @Post('set-flatrate')
    async setFlatRate(@Body()dto:flatRateDto){
        return await this.ordermgtservice.SetFlatRate(dto)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2)
    @Patch('update-flatrate/:flatrateID')
    async UpdateFlatRate(@Body()dto:EditflatRateDto,@Param('flatrateID')flatrateID:number){
        return await this.ordermgtservice.EditFlatRate(dto,flatrateID)
    }


    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,)
    @Delete('delete-flatrate/:flatrateID')
    async DeleteFlatrate(@Param('flatrateID')flatrateID:number){
        return await this.ordermgtservice.DeleteFlatRate(flatrateID)
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('get-flatrate')
    async GetFlatrate(){
        return await this.ordermgtservice.GetflatRate()
    }

    @AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)
    @Get('revenue')
    async Revenue(){
        return await this.ordermgtservice.getRevenueFromSuccessfulOrders()
    }



}
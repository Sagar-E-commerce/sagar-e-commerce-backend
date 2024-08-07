import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CourierDto, FedbackDto, NewsLetterDto, ProcessPaymentDto, confirmOrderDto } from "../dto/otherDto";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { Role } from "src/Enums/all-enums";

@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.USER)
@Controller('order')
export class OrderController{
    constructor(private orderservice:OrderService){}

    @Get('fetch-available-courier-services/:orderID')
    async availableCourierservice( @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.FetchAvailableCourierService(req.user,orderID)
    }

    @Post('select-courier/:orderID')
    async selectCourierservice(@Body()dto:CourierDto, @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.selectCourier(req.user,orderID,dto)
    }

    @Post('create-shipment/:orderID')
    async createShipment( @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.createShipment(req.user,orderID)
    }

    @Post('request-pickup/:orderID')
    async requestPickup( @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.RequestPickup(req.user,orderID)
    }
   
   
    @Post('confirm-order/:orderID')
    async confirmOrder(@Body()dto:confirmOrderDto, @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.confirmOrder(req.user,dto,orderID)
    }


    @Post('process-payment/:orderID')
    async ProcessPayment(@Body()dto:ProcessPaymentDto, @Param('orderID')orderID:string){
        return await this.orderservice.processPayment(orderID,dto)
    }

    
    @Get('get-all-my-orders')
    async GetAllOrders(@Query('page')page:number, @Query('limit')limit:number,@Req()req){
        return await this.orderservice.GetAllOrder(req.user,page,limit)
    }

    @Get('get-one-order/:orderID')
    async GetOneOrder(@Param('orderID')orderID:string, @Req()req){
        return await this.orderservice.GetOneOrder(req.user,orderID)
    }


   


    

}
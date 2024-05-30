import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { FedbackDto, NewsLetterDto, confirmOrderDto } from "../dto/otherDto";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { Role } from "src/Enums/all-enums";

@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.USER)
@Controller('order')
export class OrderController{
    constructor(private orderservice:OrderService){}

   

   
    @Post('confirm-order/:orderID')
    async confirmOrder(@Body()dto:confirmOrderDto, @Req()req, @Param('orderID')orderID:string){
        return await this.orderservice.confirmOrder(req.user,dto,orderID)
    }


    

}
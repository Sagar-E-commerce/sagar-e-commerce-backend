import { Body, Controller, Post, Req,Get,Patch, Param, UseGuards, Delete, Query } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "../dto/otherDto";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { Role } from "src/Enums/all-enums";
import { IProduct } from "src/Entity/products.entity";

@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.USER)

@Controller('cart')
export class CartController{
    constructor(private cartService:CartService){}

    @Post('add/:productID')
    async addToCart(@Param('productID')productID:number,@Body() dto: AddToCartDto, @Req() req){
      return await this.cartService.AddToCart(req.user,productID,dto);
    }

    @Patch('increase-quantity/:cartitemId')
    async IncreaseQantity(@Param('cartitemId')cartitemId:string, @Req()req,@Body()dto:UpdateCartItemDto){
      return await this.cartService.IncreaseCartItemQuantity(req.user,cartitemId,dto)
    }

    @Patch('decrease-quantity/:cartitemId')
    async DecreaseQantity(@Param('cartitemId')cartitemId:string, @Req()req,@Body()dto:UpdateCartItemDto){
      return await this.cartService.DecreaseCartItemQuantity(req.user,cartitemId,dto)
    }

    @Delete('remove-item-from-cart/:cartItemId')
    async removeItemFromCart(@Req()req, @Param('cartItemId')cartItemId:string){
      return await this.cartService.RemoveFromCart(req.user, cartItemId)    }
  
    @Get('fetch-cart')
    async getCart(@Req() req) {
      return await this.cartService.getCart(req.user);
    }
  
    @Post('checkout/')
    async checkoutCart(@Req() req) {
      return await this.cartService.checkoutCart(req.user);
    }

  


}
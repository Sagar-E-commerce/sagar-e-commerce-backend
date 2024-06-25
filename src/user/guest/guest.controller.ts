import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BrowseService } from './guest.service';
import { AddToCartDto, FedbackDto, NewsLetterDto, UpdateCartItemDto, confirmOrderDto } from '../dto/otherDto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/Enums/all-enums';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';


@Controller('browse')
export class BrowseController {
  constructor(private readonly browseservice: BrowseService) {}

  @Get('search-product')
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('sort') sort?: string,
    
    
    
  ) {
    return this.browseservice.searchProducts(
      keyword,page,perPage,sort)
  }

  @Get('fetch-all-videos')
  async FetchAllVideo(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.fetchAllVideos(page, limit);
  }

  @Get('fetch-all-products')
  async FetchAllProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.fetchAllProducts(page, limit);
  }

  @Get('fetch-all-latest-products')
  async FetchAllLatestProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.fetchLatestProducts(page, limit);
  }

  @Get('fetch-all-hottest-products')
  async FetchAllHotestProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.fetchHottestProducts(page, limit);
  }




  @Get('fetch-one-product/:productID')
  async FetchOneProduct(@Param('productID') productID: number) {
    return await this.browseservice.fetchOneProduct(productID);
  }

  @Get('fetch-all-product-categories')
  async FetchAllProductCategories(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.FetchAllProductCategories(page, limit);
  }

  @Get('fetch-one-product-category-with-products/:categoryID')
  async FetchOneProductCategoryWithProducts(
    @Param('categoryID') categoryID: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.browseservice.FetchOneProductCategoriesWithProduct(
      page,
      limit,
      categoryID,
    );
  }


  ////////////////////////////////// must be authenticated ////////////////////////////////////

  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.USER)
  @Post('add-product-to-favourite/:productID')
  async LikeProduct(
    @Param('productID', ParseIntPipe) productID: number,
    @Req() req,
  ) {
    return await this.browseservice.AddProductToFavourite(productID, req.user);
  }


  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.USER)
  @Delete('remove-product-from-favourites/:productID')
  async UnLikeProduct(
    @Param('productID', ParseIntPipe) productID: number,
    @Req() req,
  ) {
    return await this.browseservice.removeProductfromFavourites(
      productID,
      req.user,
    );
  }


  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.USER)
  @Get('all-myFavourite-products')
  async GetFavouriteProducts(@Req()req){
    return await this.browseservice.GetUserFavouriteProduct(req.user)
  }



  //////////////////////////////////////////////////////////////////////////////////////////
  

  @Get('track-order')
  async TrackOrder(@Query('keyword') keyword: string | any) {
    return await this.browseservice.TrackOrder(keyword);
  }

  @Post('newsletter')
  async NewsLetter(@Body() dto: NewsLetterDto) {
    return await this.browseservice.SubsribeToNewsLetter(dto);
  }

  @Post('feedback')
  async FeedBack(@Body() dto: FedbackDto) {
    return await this.browseservice.FeedBack(dto);
  }



  @Post('guest-add-product-to-cart/:productID')
  async AddProductToCart(@Body()dto:AddToCartDto,@Param('productID')productID:number){
    
      return await this.browseservice.GuestAddToCart(productID, dto);
  }

  @Patch('guest-decrease-quantity/:cartid/:cartitemId')
  async DecreaseQantity(@Param('cartitemId')cartitemId:string, @Param('cartid')cartid:string,@Body()dto:UpdateCartItemDto){
    return await this.browseservice.DecreaseCartItemQuantity(cartid,cartitemId,dto)
  }

  
  @Patch('guest-increase-quantity/:cartid/:cartitemId')
  async IncreaseQantity(@Param('cartitemId')cartitemId:string, @Param('cartid')cartid:string,@Body()dto:UpdateCartItemDto){
    return await this.browseservice.IncreaseCartItemQuantity(cartid,cartitemId,dto)
  }


  @Get('fetch-guest-cart/:cartId')
  async getCart(@Param('cartId')cartId:string) {
    return await this.browseservice.getCart(cartId);
  }

  @Delete('guest-remove-item-from-cart/:cartID/:cartItemID')
  async RemoveItemFromCart(@Param('cartID')cartID:string,@Param('cartItemID')cartItemID:string){
    return await this.browseservice.GuestRemoveItemFromCart(cartID,cartItemID)
  }


  @Post('guest-checkout-item-from-cart/:cartID')
  async CheckOut(@Param('cartID')cartID:string){
    return await this.browseservice.checkoutCart(cartID)
  }


  @Post('guest-confirm-order/:orderID')
  async ConfirmOrder(@Param('orderID')orderID:string,@Body()dto:confirmOrderDto){
    return await this.browseservice.confirmGuestUserOrder(dto,orderID)
  }

}

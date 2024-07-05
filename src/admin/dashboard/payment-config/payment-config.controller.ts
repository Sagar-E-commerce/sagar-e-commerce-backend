import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { RazorPayPaymentGatewayService } from "./razorpay.service";
import { CashfreePaymentGatewayService } from "./cashfree.service";
import { PayUmoneyPaymentGatewayService } from "./payumoney.service";
import { UpdatePaymentGatewayConfigService } from "./update-payment.service";
import { CashfreeConfigDto, PayUMoneyConfigDto, RazorpayConfigDto, UpdateCashfreeConfigDto, UpdatePaymentGatewayDto } from "src/admin/dto/payment-config.dto";
import { Request, Response } from 'express';
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { AdminAccessLevels, AdminType, Role } from "src/Enums/all-enums";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";
import { AdminTypeGuard } from "src/auth/guard/admintype.guard";
import { AdminTypes } from "src/auth/decorator/admintype.decorator";


@Controller('payment-gateway-config')
export class PaymentGateWayController{
    constructor(private readonly razorpaymentservice:RazorPayPaymentGatewayService,
        private readonly cashfreepaymentservice:CashfreePaymentGatewayService,
        private readonly payUmoneypaymentservice:PayUmoneyPaymentGatewayService,
        private readonly updatepaymentgtewayservice:UpdatePaymentGatewayConfigService
    ){}

    @Get('/payment-config')
    async GetPaymetConfig(){
        return await this.updatepaymentgtewayservice.getConfig()
    }

    @UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard,AdminTypeGuard)
    @Roles(Role.ADMIN)
    @AdminAccessLevel(AdminAccessLevels.LEVEL3)
    @AdminTypes(AdminType.SUPERADMIN)
    @Post("/first-click-to-set-gateway")
    async createGateway(@Body() dto: UpdatePaymentGatewayDto,) {
      return await this.updatepaymentgtewayservice.firstclicktoSelectPaymentGateway(dto);
    }

    @UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard,AdminTypeGuard)
    @Roles(Role.ADMIN)
    @AdminAccessLevel(AdminAccessLevels.LEVEL3)
    @AdminTypes(AdminType.SUPERADMIN)
    @Patch('/select-gateway/:id')
    async UpdatePaymentGatewaySelectionFromAdmin(@Body()dto:UpdatePaymentGatewayDto, @Param('id')id:number){
        return await this.updatepaymentgtewayservice.updateSelectedGateway(dto,id)
    }

    //  config payment gateways 

    @Post('/razorPay')
    async configureRazorPay(@Body()dto:RazorpayConfigDto){
        return await this.razorpaymentservice.ConfigureRazorPay(dto)

    }


    @Patch('/razorPay/:razorpayID')
    async UpdateconfigureRazorPay(@Body()dto:RazorpayConfigDto,@Param('razorpayID')razorpayID:number){
        return await this.razorpaymentservice.UpdateConfigureRazorPay(dto,razorpayID)

    }

    // @Get('get-razorpay')
    // async getRazorPay(){
    //     return await this.razorpaymentservice.getConfig()
    // }



    @Post('/cashfree')
    async configureCashFree(@Body()dto:CashfreeConfigDto){
        return await this.cashfreepaymentservice.ConfigureCashfree(dto)

    }

    @Patch('/update-cashfree/:cashfreeID')
    async updateCashFree(@Body()dto:UpdateCashfreeConfigDto, @Param('cashfreeID')cashfreeID:number){
        return await this.cashfreepaymentservice.UpdateConfigurationCashfree(dto,cashfreeID)

    }

    @Get('get-cashfree')
    async getCashfree(){
        return await this.cashfreepaymentservice.getConfig()
    }

    @Post('/payUmoney')
    async configurePayUmoney(@Body()dto: PayUMoneyConfigDto ){
        return await this.payUmoneypaymentservice.payUmoneyConfig(dto)

    }

    @Patch('/payUmoney/:payUmoneyID')
    async UpdatePayUmoney(@Body()dto: PayUMoneyConfigDto, @Param('payUmoneyID')payUmoneyID:number ){
        return await this.payUmoneypaymentservice.updatePayumoneyConfig(dto, payUmoneyID)

    }

    @Get('get-payUmoney')
    async getPayUmoney(){
        return await this.payUmoneypaymentservice.getConfig()
    }



    //webhooks 

    @Post('/webhook/razorpay')
    async handleRaorPayWebhook(@Res() res: Response, @Req() req: Request) {
      return await this.razorpaymentservice.handleRazorpayWebhook(req, res);
    }


    @Post('/webhook/payUmoney')
    async handlePayUmoneyWebhook(@Res() res: Response, @Req() req: Request) {
      return await this.payUmoneypaymentservice.handlePayuMoneyWebhook(req, res);
    }


    @Post('/webhook/cashfree')
    async handleCashFreeWebhook(@Res() res: Response, @Req() req: Request) {
      return await this.cashfreepaymentservice.handleCashfreeWebhook(req, res);
    }

}
import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { RazorPayPaymentGatewayService } from "./razorpay.service";
import { CashfreePaymentGatewayService } from "./cashfree.service";
import { PayUmoneyPaymentGatewayService } from "./payumoney.service";
import { UpdatePaymentGatewayConfigService } from "./update-payment.service";
import { CashfreeConfigDto, PayUMoneyConfigDto, RazorpayConfigDto, UpdatePaymentGatewayDto } from "src/admin/dto/payment-config.dto";
import { Request, Response } from 'express';
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Role } from "src/Enums/all-enums";
import { Roles } from "src/auth/decorator/role.decorator";

@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.ADMIN)
@Controller('payment-gateway-config')
export class PaymentGateWayController{
    constructor(private readonly razorpaymentservice:RazorPayPaymentGatewayService,
        private readonly cashfreepaymentservice:CashfreePaymentGatewayService,
        private readonly payUmoneypaymentservice:PayUmoneyPaymentGatewayService,
        private readonly updatepaymentgtewayservice:UpdatePaymentGatewayConfigService
    ){}

    @Get('payment-config')
    async GetPaymetConfig(){
        return await this.updatepaymentgtewayservice.getConfig()
    }

    @Patch('/select-gateway/:id')
    async UpdatePaymentGatewaySelectionFromAdmin(@Body()dto:UpdatePaymentGatewayDto, @Param('id')id:number){
        return await this.updatepaymentgtewayservice.updateSelectedGateway(dto,id)
    }

    //  config payment gateways 

    @Patch('/razorPay')
    async configureRazorPay(@Body()dto:RazorpayConfigDto){
        return await this.razorpaymentservice.updateConfigRazorPay(dto)

    }

    @Patch('/cashfree')
    async configureCashFree(@Body()dto:CashfreeConfigDto){
        return await this.cashfreepaymentservice.updateConfigCashfree(dto)

    }

    @Patch('/payUmoney')
    async configurePayUmoney(@Body()dto: PayUMoneyConfigDto ){
        return await this.payUmoneypaymentservice.updateConfig(dto)

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
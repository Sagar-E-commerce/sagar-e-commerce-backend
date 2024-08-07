import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ShiprocketService } from "./services/shiprocket.service";
import { Request, Response } from "express";

@Controller('common')
export class CommonController{
    constructor(private readonly shiprocketservice:ShiprocketService){}

    @Post('/shiprocket-webhook')
    async ShipRocketWebhook(@Res()res:Response, @Req()req:Request){
        return await this.shiprocketservice.handleShiprocketWebhook(req,res)
    }

    @Get('/get-channels')
    async channels(){
        return await this.shiprocketservice.getChannels()
    }
}
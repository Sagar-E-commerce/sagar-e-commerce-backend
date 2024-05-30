import { Controller, Post, Req, Res } from "@nestjs/common";
import { WebhookService } from "./webhooks.service";
import { Request, Response } from 'express';


@Controller('webhook')
export class WebhookControllers{
    constructor(private readonly webhookService:WebhookService){}

    @Post('/')
    async handleWebhook(@Res() res: Response, @Req() req: Request) {
      return await this.webhookService.handlePaystackWebhook(req, res);
    
}
}
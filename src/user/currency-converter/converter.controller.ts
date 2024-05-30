import { Body, Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './converter.service';
import { ConverterDto } from '../dto/otherDto';


@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  async convertCurrency(
   @Body()dto:ConverterDto
  ) {
    const {amount, fromCurrency, toCurrency} = dto
    const result = await this.currencyService.convertCurrency(dto);
    return { amount, fromCurrency, toCurrency, result };
  }
}

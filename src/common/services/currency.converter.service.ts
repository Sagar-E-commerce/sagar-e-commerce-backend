import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CurrencyConverterService {
    constructor(private configservice:ConfigService){}
  private readonly apiKey = this.configservice.get('EXCHANGE_RATE_API_KEY'); 

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(`https://api.exchangeratesapi.io/latest?base=${fromCurrency}&symbols=${toCurrency}&apiKey=${this.apiKey}`);
      const rates = response.data.rates;
      return amount * rates[toCurrency];
    } catch (error) {
      console.error('Currency conversion error:', error);
      throw new Error('Could not convert currency');
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ConverterDto } from '../dto/otherDto';

@Injectable()
export class CurrencyService {
  private apiKey = process.env.EXCHANGE_API_KEY
  private apiUrl = 'https://api.apilayer.com/exchangerates_data/convert';

  async convertCurrency(dto:ConverterDto): Promise<number> {
    try {
      const response = await axios.get(this.apiUrl, {
        headers: {
          'apikey': this.apiKey,
        },
        params: {
          to: dto.toCurrency,
          from: dto.fromCurrency,
          amount: dto.amount,
        },
      });

      if (response.data && response.data.result) {
        return response.data.result;
      } else {
        throw new InternalServerErrorException('Conversion failed. No result returned.');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      throw new InternalServerErrorException('Could not convert currency');
    }
  }
}
 

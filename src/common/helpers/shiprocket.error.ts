export class ShiprocketException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ShiprocketException';
    }
  }
  
  export class ShiprocketApiException extends ShiprocketException {
    constructor(public response: any) {
      super('Shiprocket API returned an error');
      this.name = 'ShiprocketApiException';
    }
  }
  
  export class ShiprocketNetworkException extends ShiprocketException {
    constructor(message: string) {
      super(message);
      this.name = 'ShiprocketNetworkException';
    }
  }
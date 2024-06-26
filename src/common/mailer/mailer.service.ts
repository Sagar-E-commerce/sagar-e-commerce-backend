//welcome

// otp for 2fa

// reset password token

// confirmation of other and sending tracking number

// when an order is completed
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PDFDocument, rgb } from 'pdf-lib';

@Injectable()
export class Mailer {
  constructor(private readonly mailerservice: MailerService) {}

    // Function to create the receipt PDF
    private async createReceiptPdf(
      receiptId: string,
      name: string,
      items: { description: string; quantity: number; price: number }[],
      total: number
    ): Promise<Buffer> {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);
      const { width, height } = page.getSize();
      const fontSize = 12;
  
      // Add title
      page.drawText('Receipt', { x: 50, y: height - 50, size: fontSize * 2, color: rgb(0, 0, 0) });
  
      // Add receipt details
      page.drawText(`Receipt ID: ${receiptId}`, { x: 50, y: height - 80, size: fontSize });
      page.drawText(`Name: ${name}`, { x: 50, y: height - 100, size: fontSize });
  
      // Add items table
      let y = height - 140;
      page.drawText('Description', { x: 50, y, size: fontSize });
      page.drawText('Quantity', { x: 200, y, size: fontSize });
      page.drawText('Price', { x: 300, y, size: fontSize });
      y -= 20;
      items.forEach((item) => {
        page.drawText(item.description, { x: 50, y, size: fontSize });
        page.drawText(item.quantity.toString(), { x: 200, y, size: fontSize });
        page.drawText(item.price.toFixed(2), { x: 300, y, size: fontSize });
        y -= 20;
      });
  
      // Add total
      page.drawText(`Total: ${total.toFixed(2)}`, { x: 50, y: y - 20, size: fontSize });
  
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    }



  async SendVerificationeMail(
    email: string,
    name: string,
    otpCode: string,
    expires: Date,
  ): Promise<void> {
    const subject = 'Two factor Verification for The Gearmates';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Two Factor Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .otp {
          text-align: center;
          font-size: 30px;
          color: #black;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Dear ${name},</h1>
        <p class="message">Your one-time password (OTP) for verification is:</p>
        <p class="otp">${otpCode}</p>
        <p class="message">This OTP is valid for a single use and expires in ${expires} minutes. If you did not request this OTP, please ignore this email.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
    
      
      `;

    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }

  async SendPasswordResetLinkMail(
    email: string,
    resettoken: string,
    name: string,
  ): Promise<void> {
    const subject = 'Password Reset Token';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Token</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
      }
      .social-icons {
        margin-top: 10px;
      }
      .social-icons img {
        width: 30px;
        margin: 0 5px;
      }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Password Reset Token</h1>
        <p class="message">Hi ${name},</p>
        <p class="message">Your password reset token is:</p>
        <p class="message"><strong>${resettoken}</strong></p>
        <p class="message">We are sorry you couldn't access The Gearmates platform. Please use the provided reset token to set a new password. This token is valid for a limited time.</p>
        <p class="message">If you did not request this reset link, please ignore this email. Your account will remain secure.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
    
      `;

    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }

  async WelcomeMail(email: string, name: string): Promise<void> {
    const subject = 'Welcome To The Gearmates';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to The Gearmates</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: black;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Welcome to The Gearmates, ${name}!</h1>
        <p class="message">We are thrilled to have you join our platform. With The Gearmates, you can easily browse and purchase amazing Smart devices and accessories, track orders in real-time, and more.</p>
        <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at <a class="button" href="mailto:support@thegearmates.com">support@thegearmates.com</a>.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
    
    `;
  
    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }
  
  async WelcomeMailAdmin(email: string, name: string): Promise<void> {
    const subject = 'Welcome To The Gearmates as an Admin';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to The Gearmates</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: black;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Welcome to The Gearmates, ${name}!</h1>
        <p class="message">We are thrilled to have you join our platform. With The Gearmates, you can easily browse and purchase amazing Smart devices and accessories, track orders in real-time, and more.</p>
        <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at <a class="button" href="mailto:support@thegearmates.com">support@thegearmates.com</a>.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
        
      </div>
    </body>
    </html>
    
    `;
  
    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }
  

  async OrderAcceptedMail(
    email: string,
    name: string,
    trackingID: string,
    orderID:string
  
  ): Promise<void> {
    const subject = 'Order Details From The Gearmates';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Details</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Order Confirmation</h1>
        <p class="message">Hello ${name},</p>
        <p class="message">Thank you for your purchase! Your order has been confirmed and is now being processed. Here are the details:</p>
        <p class="message"><strong>Order ID:</strong> ${orderID}</p>
        <p class="message"><strong>Tracking Number:</strong> ${trackingID}</p>
        <p class="message">You can track your order using the tracking number provided. If you have any questions or need assistance, feel free to reach out to our support team at <a class="button" href="mailto:support@thegearmates.com">support@thegearmates.com</a>.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
    
  `;

    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }


  async ParcelDroppedOfMail(
    email: string,
    name: string,
    orderID: string,
    
  ): Promise<void> {
    const subject = 'Parcel DropOff Confirmation By The Gearmates';
    const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Completed</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates">
        </div>
        <h1 class="heading">Order Completed</h1>
        <p class="message">Hello ${name},</p>
        <p class="message">We are pleased to inform you that your order (Order ID: ${orderID}) has been successfully delivered and completed. We hope you are happy with your purchase!</p>
        <p class="message">Thank you for choosing The Gearmates. If you have any feedback or need further assistance, feel free to contact our support team at <a class="button" href="mailto:support@thegearmates.com">support@thegearmates.com</a>.</p>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
    
  `;

}


// Function to send order confirmation with receipt PDF
async sendOrderConfirmationWithReceipt(
  email: string,
  name: string,
  trackingID:string,
  receiptId: string,
  items: { description: string; quantity: number; price: number }[],
  total: number
): Promise<void> {
  const subject = 'Order Confirmation and Receipt';
  const content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation and Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 10px;
        }
        .verification-heading {
          text-align: center;
          color: black;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .message {
          text-align: center;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .instructions {
          font-size: 16px;
          line-height: 1.4;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons img {
          width: 30px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://res.cloudinary.com/dma3njgsr/image/upload/v1719384671/xa5qf0iuzxpdcckoaryf.jpg" alt="The Gearmates Logo" width="100">
        </div>
        <h1 class="verification-heading">Order Confirmation</h1>
        <p class="message">Hi ${name},</p>
        <div class="instructions">
          <p>Thank you for your purchase! Attached is your receipt detailing your order.</p>
          <p class="message"><strong>Tracking Number:</strong> ${trackingID}</p>
          <p>If you have any questions or need further assistance, feel free to reach out to our support team at <a class="button" href="mailto:support@thegearmates.com">support@thegearmates.com</a></p>
        </div>
        <p class="footer">The Gearmates</p>
        <div class="social-icons">
        <a href="https://facebook.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/facebook-new.png" alt="Facebook"></a>
        <a href="https://twitter.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/twitter.png" alt="Twitter"></a>
        <a href="https://instagram.com/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/instagram-new.png" alt="Instagram"></a>
        <a href="https://linkedin.com/company/thegearmates"><img src="https://img.icons8.com/fluent/48/000000/linkedin.png" alt="LinkedIn"></a>
      </div>
      </div>
    </body>
    </html>
  `;

  const pdfBuffer = await this.createReceiptPdf(receiptId, name, items, total);

  await this.mailerservice.sendMail({
    to: email,
    subject,
    html: content,
    attachments: [
      {
        filename: 'receipt.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}





}

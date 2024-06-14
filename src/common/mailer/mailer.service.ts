//welcome

// otp for 2fa

// reset password token

// confirmation of other and sending tracking number

// when an order is completed
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class Mailer {
  constructor(private readonly mailerservice: MailerService) {}
  async SendVerificationeMail(
    email: string,
    name: string,
    otpCode: string,
    expires: Date,
  ): Promise<void> {
    const subject = 'Two factor Verification for Sagar Stores';
    const content = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Verification - Verification Linke</title>
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
            color: #0293D2;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .message {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .otp {
            text-align: center;
            font-size: 30px;
            color: #0293D2;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.4;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0293D2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
          <h1> Sagar Stores </h1>
          </div>
          <h1 class="verification-heading">Dear, ${name}!</h1>
          <p class="message">TWO STEP VERIFICATION:</p>
          
  
          <div class="instructions">
          <p>Your one-time password (OTP) for verification is: <strong>${otpCode}</strong>.</p>
          <p>This OTP is valid for a single use and expires in ${expires} minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
            
          </div>
          <p class="footer">Sagar Stores </p>
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
      <html>
        <head>
          <title>Forgot Password Reset Token</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              color: #333333;
              line-height: 1.6;
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
              color: #0293D2;
              font-size: 20px;
              margin-bottom: 10px;
            }
            .message {
              text-align: center;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .otp {
              text-align: center;
              font-size: 30px;
              color: #0293D2;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .instructions {
              font-size: 16px;
              line-height: 1.4;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #0293D2;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #777777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
            <h1> Sagar Stores </h1>
            </div>
              
            <h1 class="verification-heading">Password Reset Token</h1>
            <p class="message"><span class="username">HI ${name}</span>,</p>
            <p class="otp">Your Password Reset Token : <span class="otp-code">${resettoken}</span></p>
            <div class="instructions">
              <p>
                We are sorry you couldn't get access into Sagar Stores Single Vendor E-commerce Platform.  Please use the Reset Token  provided above to enter a new password.
              </p>
              <p>
                The password reset token is valid for a limited time, and it should be used to complete the password reset process.
              </p>
              <p>
                If you did not request this reset link, please ignore this email. Your account will remain secure.
              </p>
              <p >
              For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@sagarstores.com</a>
              </p>
            </div>
            <p class="footer">Sagar Stores</p>
          </div>
        </body>
      </html>
      `;

    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }

  async WelcomeMail(email: string, name: string): Promise<void> {
    const subject = 'Welcome To Sagar Stores';
    const content = `<!DOCTYPE html>
    <html>
      <head>
        <title>Welcome to Sagar Stores</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
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
            color: #0293D2;
            font-size: 20px;
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
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0293D2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>BABY N STUFF</h1>
          </div>
          <h1 class="verification-heading">Welcome OnBoard!</h1>
          <p class="message"><span class="username">HI ${name},</span></p>
          <div class="instructions">
            <p>We are thrilled to have you join our platform. With Sagar Stores, you can easily Browse for amazing Smart device Accessories and  Smart Devices, track orders in real-time, and more.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Happy Purchasing!</p>
            <p>For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@sagarstores.com</a></p>
          </div>
          <p class="footer">Sagar Stores</p>
        </div>
      </body>
    </html>
    `;
  
    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }
  
  async WelcomeMailAdmin(email: string, name: string): Promise<void> {
    const subject = 'Welcome To Sagar Stores';
    const content = `<!DOCTYPE html>
    <html>
      <head>
        <title>Welcome to Sagar Stores</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
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
            color: #0293D2;
            font-size: 20px;
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
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0293D2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Baby n Stuff</h1>
          </div>
          <h1 class="verification-heading">Welcome OnBoard!</h1>
          <p class="message"><span class="username">HI ${name},</span></p>
          <div class="instructions">
            <p>We are thrilled to have you join our platform. With Sagar Stores, you can easily browse and purchase amazing Smart devices Accessories and Smart Devices, track orders in real-time, and more.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Happy Purchasing!</p>
            <p>For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">sagarstores.com</a></p>
          </div>
          <p class="footer">Sagar Stores</p>
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
    const subject = 'Order Details From Sagar Stores';
    const content = `<!DOCTYPE html>
  <html>
    <head>
      <title>order accepted and payment made</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
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
          color: #0293D2;
          font-size: 20px;
          margin-bottom: 10px;
        }
        .message {
          text-align: center;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .otp {
          text-align: center;
          font-size: 30px;
          color: #0293D2;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .instructions {
          font-size: 16px;
          line-height: 1.4;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0293D2;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
        <h1> Sagar Stores </h1>
        </div>
          
        <h1 class="verification-heading">Order Details!</h1>
        <p class="message"><span class="username">HI ${name}</span>,</p>
        
        <div class="instructions">
        <p>We are excited to inform you that your payment has been successfully made for order ID: ${orderID}.</p>
<p>A tracking ID has been generated for your order. Please use the following details:</p>
<p>Tracking ID: ${trackingID}</p>
<p>Thank you for choosing Sagar Stores. Happy Purchasing!</p></p>
          <p >
          For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@sagarstores.com</a>
          </p>
        </div>
        <p class="footer">Sagar Stores</p>
      </div>
    </body>
  </html>
  `;

    await this.mailerservice.sendMail({ to: email, subject, html: content });
  }


  async ParcelDroppedOfMail(
    email: string,
    name: string,
    trackingID: string,
    
  ): Promise<void> {
    const subject = 'Parcel DropOff Confirmation By Sagar Stores';
    const content = `<!DOCTYPE html>
  <html>
    <head>
      <title>Order Delivered</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          color: #333333;
          line-height: 1.6;
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
          color: #0293D2;
          font-size: 20px;
          margin-bottom: 10px;
        }
        .message {
          text-align: center;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .otp {
          text-align: center;
          font-size: 30px;
          color: #0293D2;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .instructions {
          font-size: 16px;
          line-height: 1.4;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0293D2;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #777777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
        <h1> Baby n Stuff </h1>
        </div>
          
        <h1 class="verification-heading">The Product has Been Successfully Shipped!</h1>
        <p class="message"><span class="username">HI ${name}</span>,</p>
        
        <div class="instructions">
        <p>We are pleased to confirm that your order with tracking ID: ${trackingID} has been successfully delivered.</p>
<p>If you have any feedback or concerns regarding your delivery experience, please don't hesitate to reach out to us.</p>
<p>Thank you for choosing Sagar Stores.</p>

          <p >
          For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@sagarstores.com</a>
          </p>
        </div>
        <p class="footer">Sagar Stores</p>
      </div>
    </body>
  </html>
  `;

   
}





}

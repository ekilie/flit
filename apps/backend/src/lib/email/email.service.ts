import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SendGrid API key not configured');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(options.to)) {
        throw new Error('Invalid email address format');
      }

      const msg = {
        to: options.to,
        from: {
          email: this.configService.get<string>('sendgrid.fromEmail'),
          name: this.configService.get<string>('sendgrid.fromName'),
        },
        subject: options.subject,
        text: options.text,
        html: options.html,
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationCode: string,
  ): Promise<boolean> {
    const html = this.getVerificationEmailTemplate(name, verificationCode);
    return this.sendEmail({
      to: email,
      subject: 'Verify Your FLIT Account',
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetCode: string,
  ): Promise<boolean> {
    const html = this.getPasswordResetEmailTemplate(name, resetCode);
    return this.sendEmail({
      to: email,
      subject: 'Reset Your FLIT Password',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = this.getWelcomeEmailTemplate(name);
    return this.sendEmail({
      to: email,
      subject: 'Welcome to FLIT!',
      html,
    });
  }

  async sendRideConfirmationEmail(
    email: string,
    rideDetails: any,
  ): Promise<boolean> {
    const html = this.getRideConfirmationEmailTemplate(rideDetails);
    return this.sendEmail({
      to: email,
      subject: 'Ride Confirmation - FLIT',
      html,
    });
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationCode: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">FLIT</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Verify Your Email Address</h2>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                Hello ${name},
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                Thank you for registering with FLIT. Please use the verification code below to complete your registration:
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${verificationCode}</span>
              </div>
              <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">
                This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                &copy; 2024 FLIT. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    resetCode: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">FLIT</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                Hello ${name},
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                We received a request to reset your password. Use the code below to reset your password:
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${resetCode}</span>
              </div>
              <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">
                This code will expire in 30 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                &copy; 2024 FLIT. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FLIT</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to FLIT!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Hello ${name}!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                We're excited to have you on board! Your account has been successfully created.
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                FLIT is your trusted platform for special hire vehicle services. Get started by booking your first ride today!
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666666; font-size: 16px; margin: 0 0 20px;">
                  Thank you for choosing FLIT!
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                &copy; 2024 FLIT. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getRideConfirmationEmailTemplate(rideDetails: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ride Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Ride Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Your ride is confirmed</h2>
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                Here are your ride details:
              </p>
              <table width="100%" cellspacing="0" cellpadding="10" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="color: #666666; font-size: 14px; font-weight: bold;">Pickup Location:</td>
                  <td style="color: #333333; font-size: 14px;">${rideDetails.pickupAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; font-weight: bold;">Dropoff Location:</td>
                  <td style="color: #333333; font-size: 14px;">${rideDetails.dropoffAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; font-weight: bold;">Estimated Fare:</td>
                  <td style="color: #333333; font-size: 14px;">$${rideDetails.fare || '0.00'}</td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">
                Thank you for choosing FLIT. Have a safe journey!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                &copy; 2024 FLIT. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

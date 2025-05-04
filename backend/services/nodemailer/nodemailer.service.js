import { transporter } from "../../config/nodemailer.js";

export const sendOtpEmail = async ({ toEmail, otp, subject, type = 'OTP' }) => {
  try {
    const otpSendTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #34c759 100%);
          text-align: center;
          padding: 30px 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 10px 0 0;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          color: #555555;
          margin: 0 0 20px;
        }
        .otp {
          display: inline-block;
          font-size: 28px;
          font-weight: bold;
          color: #ffffff;
          background-color: #28a745;
          padding: 12px 24px;
          border-radius: 8px;
          letter-spacing: 3px;
          margin: 20px 0;
        }
        .note {
          font-size: 14px;
          color: #777777;
          margin-top: 10px;
          font-style: italic;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #777777;
        }
        .footer a {
          color: #28a745;
          text-decoration: none;
          font-weight: 500;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media screen and (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 8px;
          }
          .header {
            padding: 20px;
          }
          .header h1 {
            font-size: 20px;
          }
          .content {
            padding: 20px;
          }
          .otp {
            font-size: 24px;
            padding: 10px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Your Verification Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for using Cafebit! Your one-time password (OTP) for verification is:</p>
          <div class="otp">${otp}</div>
          <p>This code is valid for the next 5 minutes. Please enter it to complete your verification.</p>
          <p class="note">Simply type or paste this code into the verification form.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this code, please ignore this email or <a href="mailto:support@Cafebit.com">contact us</a>.</p>
          <p>Best regards, <br> The Cafebit Team</p>
          <p><a href="https://Cafebit.com/privacy">Privacy Policy</a> | <a href="https://Cafebit.com/terms">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const forgotPasswordTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #34c759 100%);
          text-align: center;
          padding: 30px 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 10px 0 0;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          color: #555555;
          margin: 0 0 20px;
        }
        .reset-link {
          display: inline-block;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          background-color: #28a745;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          margin: 20px 0;
        }
        .reset-fallback {
          margin-top: 20px;
          font-size: 14px;
          color: #555555;
        }
        .reset-url {
          word-break: break-all;
          color: #28a745;
          text-decoration: underline;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #777777;
        }
        .footer a {
          color: #28a745;
          text-decoration: none;
          font-weight: 500;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media screen and (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 8px;
          }
          .header {
            padding: 20px;
          }
          .header h1 {
            font-size: 20px;
          }
          .content {
            padding: 20px;
          }
          .reset-link {
            font-size: 14px;
            padding: 10px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your Cafebit account password. Click the button below to proceed:</p>
          <a href="${otp}" class="reset-link">Reset Password</a>
          <div class="reset-fallback">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p class="reset-url">${otp}</p>
          </div>
          <p>This link will expire in 15 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email or <a href="mailto:support@Cafebit.com">contact us</a>.</p>
          <p>Best regards, <br> The Cafebit Team</p>
          <p><a href="https://Cafebit.com/privacy">Privacy Policy</a> | <a href="https://Cafebit.com/terms">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.NODEMAILER_AUTH_USER,
      to: toEmail,
      subject: subject || (type === 'OTP' ? 'Your Cafebit Verification Code' : 'Cafebit Password Reset Request'),
      html: type === 'OTP' ? otpSendTemplate : forgotPasswordTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("sendOtpEmail ---> ", { info });
    return true;

  } catch (error) {
    console.error('sendOtpEmail :: Error sending email:', error);
    return false;
  }
};
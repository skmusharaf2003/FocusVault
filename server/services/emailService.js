import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify Your Email - Focus Vault',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Focus Vault!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining Focus Vault! To get started with your learning journey, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <p style="color: #8B5CF6; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account with Focus Vault, 
              you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendStudyReminder(user) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "It's Your Study Time! 📚 - Focus Vault",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 Study Time Reminder</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hey ${user.name}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              It's your preferred study time! Don't let your learning streak break. 
              Jump back into Focus Vault and continue your educational journey.
            </p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-weight: bold;">
                🔥 Current Streak: ${user.stats.currentStreak} days
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" 
                 style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Start Studying Now 🚀
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              You can disable these reminders in your profile settings.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Study reminder sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send study reminder:', error);
      throw error;
    }
  }
}

export default new EmailService();
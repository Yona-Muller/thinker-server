import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './email-verification.entity';
import { MailService } from 'src/utils/mail/mail.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly mailService: MailService
  ) {}

  private generateRandomSixDigitCode(): string {
    const randomNumber = Math.floor(Math.random() * 1000000);
    return randomNumber.toString().padStart(6, '0');
  }

  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      await this.mailService.sendEmail({
        to: email,
        subject: 'Your Verification Code',
        text: `Hello,\n\nYour one-time verification code is: ${code}\n\nFor security reasons, please do not share this code with anyone.\n\nPlease note, this code will be valid for a limited time only, so be sure to use it soon.\n\nIf you did not request this code, you can safely ignore this email.\n\nBest regards,\nPassable.`,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async create(email: string): Promise<string> {
    try {
      const verificationCode = this.generateRandomSixDigitCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const existingEntry = await this.emailVerificationRepository.findOne({ where: { email } });

      if (existingEntry) {
        existingEntry.emailVerificationCode = verificationCode;
        existingEntry.expiresAt = expiresAt;
        await this.emailVerificationRepository.save(existingEntry);
      } else {
        const emailVerification = this.emailVerificationRepository.create({
          email,
          emailVerificationCode: verificationCode,
          expiresAt,
        });
        await this.emailVerificationRepository.save(emailVerification);
      }

      await this.sendVerificationEmail(email, verificationCode);
      return 'The verification code has been sent to your email successfully.';
    } catch (error) {
      this.logger.error(`Failed to create or update email verification for ${email}:`, error);
      throw error;
    }
  }

  async verify(email: string, code: string): Promise<boolean> {
    try {
      const verification = await this.emailVerificationRepository.findOne({ where: { email } });

      if (!verification) {
        throw new Error('Verification code not found for your email. please try again.');
      }

      if (verification.expiresAt < new Date()) {
        throw new Error(`Verification code for email ${email} has expired`);
      }

      return verification.emailVerificationCode === code;
    } catch (error) {
      this.logger.error(`Failed to verify email ${email}:`, error);
      throw error;
    }
  }
}

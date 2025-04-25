import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TokenService } from './token.service';
import { MailModule } from 'src/utils/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [UsersModule, MailModule, TypeOrmModule.forFeature([EmailVerification])],
  controllers: [AuthController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    AuthService,
    TokenService,
    EmailVerificationService,
  ],
})
export class AuthModule {}

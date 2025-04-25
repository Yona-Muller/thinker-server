import { Body, Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { LoginByOTPDto, LoginByPasswordDto, GoogleOauthQueryDto, LogoutResponseDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { IsPublic } from 'src/utils/decorators/isPublic.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseUserDto } from 'src/users/dto/response-user.dro';
import { SendVerificationDto, VerifyEmailDto } from './dto/email-verification.dto';
import { EmailVerificationService } from './email-verification.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService
  ) {}

  @Post('login')
  @IsPublic()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginByPasswordDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully', type: ResponseUserDto })
  @ApiResponse({ status: 401, description: 'Incorrect user or password' })
  login(@Body() loginDto: LoginByPasswordDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('/logout')
  @IsPublic()
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logged out successfully', type: LogoutResponseDto })
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Post('login/send-otp')
  @IsPublic()
  @ApiOperation({ summary: 'Send OTP to email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email address' })
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('login/verify-otp')
  @IsPublic()
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiBody({ type: LoginByOTPDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  async verifyOtp(@Body() loginByOTPDto: LoginByOTPDto, @Res() res: Response) {
    return this.authService.login(loginByOTPDto, res);
  }

  @Get('me')
  @IsPublic()
  @ApiOperation({ summary: 'Get logged in user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: ResponseUserDto })
  @ApiResponse({ status: 401, description: 'There is no token' })
  @ApiResponse({ status: 404, description: 'User with ID not found' })
  async getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }

  @Get('oauth2/google/callback')
  @IsPublic()
  async googleCallbackHandler(@Query() googleOauthQuery: GoogleOauthQueryDto, @Res() res: Response) {
    return this.authService.loginByGoogleOauthCode(googleOauthQuery, res);
  }

  @Post('register/send-verification')
  @IsPublic()
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiBody({ type: SendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification code sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send verification code' })
  sendVerification(@Body() dto: SendVerificationDto) {
    return this.emailVerificationService.create(dto.email);
  }

  @Post('register/verify-email')
  @IsPublic()
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerificationService.verify(dto.email, dto.code);
  }
}

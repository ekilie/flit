import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { VerifyResetCodeDto } from 'src/modules/auth/dto/verify-reset-code.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { SendVerificationDto } from 'src/modules/auth/dto/send-verification.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorator/public.decorator';

@ApiTags('Auth')
@ApiBearerAuth('JWT')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // TODO: Will rethink this later
  @Post('register-driver')
  @ApiOperation({ summary: 'Register a new driver' })
  async registerDriver(@Body() registerDto: RegisterDto) {
    // return this.authService.registerDriver(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    return this.authService.logout();
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user?.userId);
  }

  @Public()
  @Post('auth/send-verification')
  @ApiOperation({ summary: 'Send verification email' })
  async sendVerification(@Body() sendVerificationDto: SendVerificationDto) {
    return this.authService.sendVerificationEmail(sendVerificationDto.email);
  }

  @Public()
  @Post('auth/verify')
  @ApiOperation({ summary: 'Verify user account with OTP' })
  async verifyAccount(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyAccount(verifyOtpDto);
  }

  @Public()
  @Post('auth/forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('auth/verify-reset-code')
  @ApiOperation({ summary: 'Verify password reset code' })
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  @Public()
  @Post('auth/reset-password')
  @ApiOperation({ summary: 'Reset password with verified code' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordWithOtp(resetPasswordDto);
  }
}

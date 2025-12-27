import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { ExcludeFromObject } from 'src/common/dto/sanitize-response.dto';

// In-memory OTP storage (In production, use Redis or database)
const otpStorage = new Map<
  string,
  { otp: string; expiresAt: Date; type: string }
>();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await user.comparePassword(pass))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return ExcludeFromObject(user, ['password']) as User;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private storeOTP(email: string, otp: string, type: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
    otpStorage.set(email, { otp, expiresAt, type });
  }

  private verifyOTP(email: string, otp: string, type: string): boolean {
    const stored = otpStorage.get(email);
    if (!stored) {
      return false;
    }

    if (stored.type !== type) {
      return false;
    }

    if (stored.expiresAt < new Date()) {
      otpStorage.delete(email);
      return false;
    }

    return stored.otp === otp;
  }

  @Public()
  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create({
      fullName: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      phoneNumber: '', // Can be added later in profile update
    });

    // Generate verification OTP
    const otp = this.generateOTP();
    this.storeOTP(registerDto.email, otp, 'verification');

    // In production, send email with OTP
    console.log(`Verification OTP for ${registerDto.email}: ${otp}`);

    return {
      message:
        'Registration successful! Please check your email for verification code.',
      user: ExcludeFromObject(user, ['password']),
    };
  }

  @Public()
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    // Update last login
    await this.usersService.update(user.id, { lastLogin: new Date() });

    const payload = { email: user.email, sub: user.id, userId: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      message: 'Login successful',
      user: ExcludeFromObject(user, ['password']),
      token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout() {
    // In production, invalidate tokens (use Redis blacklist)
    return {
      message: 'Logout successful',
    };
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { email: user.email, sub: user.id, userId: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      token: accessToken,
      refresh_token: refreshToken,
      refresh_token_expires_at: expiresAt.toISOString(),
    };
  }

  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOTP();
    this.storeOTP(email, otp, 'verification');

    // In production, send email with OTP
    console.log(`Verification OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: 'Verification code sent to your email',
    };
  }

  async verifyAccount(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    if (!this.verifyOTP(email, otp, 'verification')) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Mark user as verified
    await this.usersService.update(user.id, { emailVerified: true });

    otpStorage.delete(email);

    return {
      success: true,
      message: 'Account verified successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOTP();
    this.storeOTP(dto.email, otp, 'reset');

    // In production, send email with OTP
    console.log(`Password reset OTP for ${dto.email}: ${otp}`);

    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  }

  async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto) {
    const { email, otp } = verifyResetCodeDto;

    if (!this.verifyOTP(email, otp, 'reset')) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    return {
      success: true,
      message: 'Reset code verified successfully',
    };
  }

  async resetPasswordWithOtp(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, new_password } = resetPasswordDto;

    if (!this.verifyOTP(email, otp, 'reset')) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.usersService.updatePassword(user.id, new_password);
    otpStorage.delete(email);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async resetPassword(token: string, password: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_SECRET || 'reset-secret',
      });

      const user = await this.usersService.findOne(decoded.userId);
      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      await this.usersService.updatePassword(decoded.userId, password);
      return { message: 'Password successfully reset' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!(await user.comparePassword(dto.currentPassword))) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    await this.usersService.updatePassword(userId, dto.newPassword);
    return { message: 'Password successfully changed' };
  }
}

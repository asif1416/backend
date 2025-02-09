import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../customer/customer.entity';
import { AuthDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { config } from 'dotenv';

config();
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  async registerAuth(createAuthDto: AuthDto): Promise<any> {
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createAuthDto.email },
    });

    if (existingCustomer) {
      if (!existingCustomer.active) {
        await this.generateAndSendOTP(existingCustomer.email);
        return {
          message:
            'Account exists but is inactive. OTP has been sent for verification.',
        };
      }
      throw new BadRequestException('User with this email already exists.');
    }

    const saltRounds = 10;
    createAuthDto.password = await bcrypt.hash(
      createAuthDto.password,
      saltRounds,
    );

    delete createAuthDto.confirmPassword;

    const newCustomer = this.customerRepository.create({
      ...createAuthDto,
      active: false,
    });

    await this.customerRepository.save(newCustomer);

    await this.generateAndSendOTP(createAuthDto.email);

    return {
      message:
        'Registration successful. Please verify your email with the OTP sent.',
    };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new UnauthorizedException('User with this email does not exist.');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { id: customer.id, email: customer.email };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
    };
  }

  async sendMail(email: string, otp: string): Promise<void> {
    const message = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #f49b33;">Calinary Odissey!</h2>
      <p style="font-size: 16px; color: #333333; text-align: center;">This is the verification code for registering or restting password. Please use the following OTP to verify your email address and complete the process.</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #f49b33; color: #ffffff; border-radius: 5px; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #333333; text-align: center;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #888888; text-align: center;">Calinary Odissey Team</p>
    </div>
  </div>
  `;

    await this.mailService.sendMail({
      from: 'Calinary Odyssey <no-reply@example.com>',
      to: email,
      subject: 'Your OTP for Calinary Odyssey',
      html: message,
    });
  }

  async generateAndSendOTP(email: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new BadRequestException('User with this email does not exist.');
    }

    const lockoutDuration = 2 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const lastResetTime = new Date(customer.lastReset).getTime();

    if (
      customer.attempt >= 5 &&
      currentTime - lastResetTime < lockoutDuration
    ) {
      throw new UnauthorizedException(
        'Too many attempts. Try again in 2 hours.',
      );
    }

    const otpInterval =  60 * 1000;
    if (currentTime - lastResetTime < otpInterval) {
      const timeLeft = Math.ceil(
        (otpInterval - (currentTime - lastResetTime)) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${timeLeft} seconds before requesting another OTP.`,
      );
    }

    if (customer.attempt >= 5) {
      customer.lastReset = new Date();
      customer.attempt = 0; 
      await this.customerRepository.save(customer);
      throw new UnauthorizedException(
        'Maximum attempts reached. Try again in 2 hours.',
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.otp = parseInt(otp, 10);
    customer.attempt += 1;
    customer.lastReset = new Date();

    await this.customerRepository.save(customer);

    try {
      await this.sendMail(email, otp);
    } catch (error) {
      throw new BadRequestException("Failed to send OTP email. Please try again.");
    }
  }

  async verifyOTP(email: string, otp: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new BadRequestException('User with this email does not exist.');
    }

    if (customer.otp !== otp) {
      await this.customerRepository.save(customer);
      throw new BadRequestException('Invalid OTP.');
    }

    const currentTime = new Date().getTime();
    const otpGeneratedTime = new Date(customer.lastReset).getTime();

    if (currentTime - otpGeneratedTime > 5 * 60 * 1000) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    customer.otp = null;
    customer.attempt = 0;
    customer.lastReset = null;
    if (!customer.active) {
      customer.active = true;
    }

    await this.customerRepository.save(customer);
  }

  async resetPassword(email: string, password: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new BadRequestException('User with this email does not exist.');
    }
    const isSamePassword = await bcrypt.compare(password, customer.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password.',
      );
    }

    const saltRounds = 10;
    customer.password = await bcrypt.hash(password, saltRounds);

    await this.customerRepository.save(customer);
  }

  validateToken(token: string): { isLoggedIn: boolean; user?: any } {
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: 'idkmysecretkey', 
      });
      return { isLoggedIn: true, user: decodedToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Logout successful' };
  }
}

import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsString()
  @MinLength(4, { message: 'Name length must be at least 4 letters.' })
  @MaxLength(50, { message: 'Name length must be less than 50 characters.' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  @MaxLength(50, { message: 'Email must be no more than 50 characters.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @IsString()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Confirm password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  confirmPassword?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsInt()
  otp: number;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm Password is required.' })
  confirmPassword: string;
}

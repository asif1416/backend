import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class contactDto {
  @IsString()
  @MinLength(4, { message: 'Name length must be at least 4 letters.' })
  @MaxLength(50, { message: 'Name length must be less than 50 characters.' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  @MaxLength(50, { message: 'Email must be no more than 50 characters.' })
  email: string;

  @IsString()
  @MinLength(4, { message: 'Message length must be at least 4 letters.' })
  @MaxLength(500, { message: 'Message length must not more than 500 characters.' })
  message: string;
}

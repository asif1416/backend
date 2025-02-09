import { IsNotEmpty, IsNumber, IsString, IsEmail } from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  tran_id: string;

  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  paymentStatus: string;

  @IsString()
  paymentMethod?: string;

  @IsString()
  cardIssuer?: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsNotEmpty()
  @IsString()
  customerPhone: string;
}

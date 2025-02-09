import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AuthDto } from 'src/auth/auth.dto';
import { Customer } from './customer.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  @Get('/')
  async getCustomer(@Req() request: any): Promise<Customer> {
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    return this.customerService.getCustomer(token);
  }

  @Get('/customers')
  async getAllCustomers() {
    return this.customerService.getAllCustomers();
  }

  @Get('/customers/:id')
  async getCustomerById(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomerById(id);
  }

  @Patch('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<AuthDto>,
  ) {
    return this.customerService.updateUser(id, updateData);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Repository } from 'typeorm';
import { AuthDto } from 'src/auth/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constants';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,

  ) {}

  async getCustomer(token: string): Promise<Customer> {
    const payload = this.jwtService.verify(token, {
      secret: jwtConstants.secret,
    });

    const customer = await this.customerRepository.findOne({
      where: { id: payload.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    return customer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async getCustomerById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return customer;
  }

  async updateUser(id: number, updateData: Partial<AuthDto>): Promise<Customer> {
    const user = await this.customerRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  
    Object.assign(user, updateData);
    return this.customerRepository.save(user);
  }
  
}

import { Cart } from 'src/cart/cart.entity';
import { Order } from 'src/order/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  email: string;

  @Column({ length: 500 })
  password: string;

  @Column({ length: 11, nullable: true })
  phone: string

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ default: false })
  active: boolean; 

  @Column({ type: 'int', nullable: true })
  otp: number | null;

  @Column({ type: 'int', default: 0 })
  attempt: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReset: Date | string | null;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.customer) 
  carts: Cart[];
}


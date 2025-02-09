import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/order/order.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tran_id: string;

  @Column({ nullable: true })
  total_amount: number;

  @Column()
  currency: string;

  @Column()
  paymentStatus: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  cardIssuer: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' }) 
  order: Order;
}

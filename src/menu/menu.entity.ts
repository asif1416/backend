import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from 'src/cart/cartItem.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  category: string;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true }) 
  image: string; 

  @OneToMany(() => CartItem, (cartItem) => cartItem.menu)
  cartItems: CartItem[];
}
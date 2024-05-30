import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import { UserEntity } from './users.entity';
import { ProductEntity } from './products.entity';
import { ICart, ICartItem } from 'src/user/cart/cart';


@Entity('carts')
export class CartEntity implements ICart{
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  user: UserEntity;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItemEntity[];

  @Column({ default: false })
  isCheckedOut: boolean;
}

@Entity('cart_items')
export class CartItemEntity implements ICartItem{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items)
  cart: CartEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;

  @Column({nullable:true})
  color: string;

  @Column({nullable:true})
  sizes: string;

  @Column({type:'timestamp'})
  addedAT:Date

  
}

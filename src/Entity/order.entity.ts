import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import { UserEntity } from './users.entity';
import { ProductEntity } from './products.entity';
import { IOrder, IOrderItem } from 'src/user/order/order';
import { ORDERTYPE, OrderStatus, OrderType, paymentType } from 'src/Enums/all-enums';
;

@Entity('orders')
export class OrderEntity implements IOrder {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable:true})
  orderID:string

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @Column({nullable:true})
  name: string;

  @Column({nullable:true})
  mobile: string;

  @Column({nullable:true})
  billing_address: string;

  @Column({nullable:true})
  billing_address_2:string

  @Column({nullable:true})
  billing_city: string;

  @Column({nullable:true})
  billing_state: string;

  @Column({nullable:true})
  billing_pincode: string;

  @Column({nullable:true})
  email: string;

  @Column('simple-array',{nullable:true})
  availableCourierIds: string[];


  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItemEntity[];

  @Column('decimal',{nullable:true})
  subTotal: number;

  @Column('decimal',{nullable:true})
  discount?: number;

  @Column('boolean',{nullable:true, default:false})
  IsCouponCodeApplied: boolean;

  @Column('numeric',{nullable:true, default:0})
  shippinFee: number;


  @Column('decimal',{nullable:true})
  total:number

  @Column({ default: false })
  isPaid: boolean;

  @Column({nullable:true, type:'enum', enum:ORDERTYPE})
  orderType:ORDERTYPE

  @Column({type:'enum', enum:paymentType, nullable:true})
  paymentMethod:paymentType

  @Column({nullable:true, type:"timestamp"})
  createdAT: Date;

  @Column({nullable:true})
  trackingID:string

  @Column({nullable:true,type:'enum', enum:OrderStatus})
  status: OrderStatus;

  @Column({nullable:true, type:"timestamp"})
  updatedAT: Date;

   @Column({nullable:true})
  shipmentID:string

  @Column({nullable:true})
  awbCode:string

  @Column({nullable:true})
  shiprocketPickupStatus:string


  @Column({nullable:true})
  shiprocketPickupToken:string

  @Column({nullable:true})
  pickuppincode:string

  @Column('decimal',{nullable:true})
  weight: number

  @Column('jsonb', { nullable: true })
  courierInfo: Record<string, any>;



}

@Entity('order_items')
export class OrderItemEntity implements IOrderItem{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity,{onDelete:'CASCADE'})
  product: ProductEntity;

  @Column('int',{nullable:true})
  quantity: number;

  @Column('decimal',{nullable:true})
  price: number;
}

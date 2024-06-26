import { OrderEntity, OrderItemEntity } from "src/Entity/order.entity"
import { ProductEntity } from "src/Entity/products.entity"
import { UserEntity } from "src/Entity/users.entity"
import { OrderStatus, OrderType, paymentType } from "src/Enums/all-enums"

export interface IOrder{
    id:string
    orderID:string
    user:UserEntity
    name:string
    email:string
    mobile:string
    billing_address:string
    items:OrderItemEntity[]
    subTotal: number
    discount?:number
    IsCouponCodeApplied:boolean
    shippinFee:number
    total:number
    isPaid:boolean
    createdAT:Date
    orderType:OrderType
    trackingID:string
    status:OrderStatus
    updatedAT:Date
}

export interface IOrderItem{
    id:number
    order:OrderEntity,
    product:ProductEntity
    quantity:number
    price:number

}
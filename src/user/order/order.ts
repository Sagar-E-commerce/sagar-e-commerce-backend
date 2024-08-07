import { OrderEntity, OrderItemEntity } from "src/Entity/order.entity"
import { ProductEntity } from "src/Entity/products.entity"
import { UserEntity } from "src/Entity/users.entity"
import { ORDERTYPE, OrderStatus, OrderType, paymentType } from "src/Enums/all-enums"

export interface IOrder{
    id:string
    orderID:string
    user:UserEntity
    shipmentID:string
    awbCode:string
    name:string
    email:string
    mobile:string
    billing_address:string
    billing_address_2:string
    items:OrderItemEntity[]
    subTotal: number
    discount?:number
    IsCouponCodeApplied:boolean
    shippinFee:number
    availableCourierIds: string[];
    courierInfo: Record<string, any>;
    total:number
    isPaid:boolean
    createdAT:Date
   
    // ORDERTYPE :ORDERTYPE
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
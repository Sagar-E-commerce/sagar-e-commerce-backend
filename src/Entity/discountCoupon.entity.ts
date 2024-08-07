import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { UserEntity } from "./users.entity"
import { OrderEntity } from "./order.entity"

export interface IDiscountCoupon{
    id:number
    OneTime_discountCode:string
    createdAT:Date
    updatedAT:Date
    DiscountDuration_weeks:number
    DiscountDuration_days:number
    percentageOff:number
    expires_in:Date
    isExpired:boolean

}

@Entity({name:"Discount"})
export class DiscountCouponEntity implements IDiscountCoupon{
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false})
    OneTime_discountCode: string

    @Column({nullable:true, type:"timestamp"})
    createdAT: Date

    @Column({nullable:true})
    DiscountDuration_days: number

    @Column({nullable:true})
    DiscountDuration_weeks: number

    @Column('numeric',{nullable:true})
    percentageOff: number

    @Column({nullable:true, type:"timestamp"})
    expires_in: Date

    @Column({nullable:true, type:"timestamp"})
    updatedAT: Date

    @Column({nullable:true})
    isExpired: boolean

}


export interface IDiscountUsage{
    id:number
    code:string
    appliedBy:UserEntity
    appliedAT:Date
    expiredAT:Date
}

@Entity({name:"DiscountUsage"})
export class DiscountUsageEntity implements IDiscountUsage{
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:true})
    code: string

    @Column({nullable:true, type:"timestamp"})
    appliedAT: Date

    @Column({nullable:true, type:"timestamp"})
    expiredAT: Date

    @OneToMany(()=>UserEntity,user => user)
    appliedBy: UserEntity


}

export interface IShippingFlatRate{
    id:number
    flateRate:number
    currency:string
    createdAt:Date
    updatedAt:Date
   
   

}

@Entity({name:'shippingFlatRate'})
export class ShippingFlatRateEntity implements IShippingFlatRate{
    @PrimaryGeneratedColumn()
    id: number

    @Column('numeric',{nullable:true,default:0})
    flateRate: number

    @Column({nullable:true})
    currency: string

    @Column({nullable:true, type:'timestamp'})
    createdAt: Date

    @Column({nullable:true, type:'timestamp'})
    updatedAt: Date

   

}
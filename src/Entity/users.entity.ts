
import {  AdminType, Role } from "src/Enums/all-enums";
import { IUser } from "src/user/user";
import { Column,  Entity, OneToMany, PrimaryGeneratedColumn, } from "typeorm";
import { CartEntity } from "./cart.entity";
import { OrderEntity } from "./order.entity";
import { FavouriteEntity } from "./likes.entity";
import { ProductEntity } from "./products.entity";


@Entity({name:"Users",})
export class UserEntity implements IUser{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    userID:string

    @Column({nullable:false,unique:true})
    email: string;

    @Column({nullable:false, type:'enum', enum:Role, default:Role.USER})
    role:Role

    @Column({nullable:true})
    DOB: string;

    @Column({nullable:true})
    age:number

    @Column({nullable:true})
    password: string;

    @Column({nullable:true})
    mobile: string;

    @Column({nullable:true})
    fullname: string;

    @Column({nullable:true})
    cityOfResidence: string;
   
    @Column({nullable:true,type:'timestamp'})
    UpdatedAt:Date

    @Column({nullable:true,type:'timestamp'})
    RegisteredAt:Date

    @Column({nullable:true})
    home_address:string

    @Column({nullable:true})
    profile_picture: string;

    @Column({nullable:true})
    LGA_of_Home_Address: string

    @Column({nullable:true})
    gender: string;

    @Column({nullable:true})
    Nationality: string;

    @Column({nullable:true})
    pickuppincode:string

    @Column({nullable:true})
    dropOffpincode:string


    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalRevenue: number;

    @Column({nullable:true,default:false})
    isLoggedIn: boolean;

    @Column({nullable:true,default:false})
    isRegistered: boolean;

    @Column({nullable:false,default:false})
    isVerified: boolean;

    @Column({nullable:true,type:'timestamp'})
    reset_link_exptime: Date;

    @Column({nullable:true})
    password_reset_link: string;

    @OneToMany(()=>CartEntity, cart =>cart.user)
    carts: CartEntity[];

    @OneToMany(()=>OrderEntity,order=>order.user)
    orders:OrderEntity[]

    @OneToMany(()=>FavouriteEntity,likes=>likes.user)
    favourites:FavouriteEntity[]

    
}
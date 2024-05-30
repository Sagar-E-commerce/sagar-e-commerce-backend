import { CartEntity } from "src/Entity/cart.entity";
import { FavouriteEntity } from "src/Entity/likes.entity";
import { OrderEntity } from "src/Entity/order.entity";
import { ProductEntity } from "src/Entity/products.entity";
import { Role } from "src/Enums/all-enums"

export interface  IUser {
    id:number 
    userID:string
    fullname: string;
    password:string
    Nationality: string;
    age:number;
    DOB:string
    home_address:string 
    mobile:string
    gender: string
    profile_picture: string
    LGA_of_Home_Address: string
    cityOfResidence:string
    RegisteredAt : Date
    UpdatedAt : Date
    role:Role
    isLoggedIn:boolean
    isVerified:boolean
    isRegistered:boolean
    carts:CartEntity[]
    orders:OrderEntity[]
    favourites:FavouriteEntity[]



}
import { CartEntity, CartItemEntity } from "src/Entity/cart.entity"
import { ProductEntity } from "src/Entity/products.entity"
import { UserEntity } from "src/Entity/users.entity"

export interface ICart{
    id:string
    user:UserEntity
    items:CartItemEntity[]
    isCheckedOut:boolean

}

export interface ICartItem{
    id:string
    cart:CartEntity
    product:ProductEntity
    quantity:number
    price:number
    color:string
    sizes:string
    addedAT:Date


}
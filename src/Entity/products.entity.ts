import { ProductAvailability } from "src/Enums/all-enums"
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { VideoEntity } from "./videos.entity"
import { CategoryEntity } from "./productCategory.entity"
import { FavouriteEntity } from "./likes.entity"
import { UserEntity } from "./users.entity"

export interface IProduct{
    id:number
    productID:string
    name:string
    price:number
    availability:ProductAvailability
    productImages:string[]
    stock:number
    isOutOfStock:boolean
    description:string
    createdAT:Date
    updatedAT:Date
    video:VideoEntity[]
    category: CategoryEntity;
    hasTax:boolean
    taxRate:number
    available_sizes:string[]
    available_colors:string[]
    favourites: FavouriteEntity[]
    

}

@Entity({name:'Products'})
export class ProductEntity implements IProduct{
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:true})
    productID: string


    @Column({nullable:true})
    name: string

    @Column('numeric',{nullable:true})
    price: number

    @Column({nullable:true})
    hasTax:boolean

    @Column('decimal',{nullable:true,})
    taxRate:number

    @Column({nullable:true,type:'simple-array'})
    productImages: string[]


    @Column({nullable:true})
    description: string

    @Column({nullable:true})
    stock: number

    @Column({nullable:true,type:'timestamp'})
    restockedAT:Date

    @Column({nullable:true,type:'timestamp'})
    stockAdjustedAT:Date

    @Column({nullable:true,type:'enum', enum:ProductAvailability})
    availability: ProductAvailability

    @Column({nullable:true, type:'boolean'})
    isOutOfStock: boolean

    @Column({type:'simple-array',nullable:true})
    available_colors: string[]

    @Column({type:'simple-array',nullable:true})
    available_sizes: string[]

    @Column({nullable:true,type:'timestamp'})
    createdAT: Date

    @Column({nullable:true,type:'timestamp'})
    updatedAT: Date

    @OneToMany(()=>VideoEntity,vid=> vid.product)
    video: VideoEntity[]

    @ManyToOne(() => CategoryEntity, (category) => category.products)
    category: CategoryEntity;

    @OneToMany(()=>FavouriteEntity,like=>like.product)
    favourites: FavouriteEntity[]







}
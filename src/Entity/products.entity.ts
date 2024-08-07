import { ProductAvailability } from "src/Enums/all-enums"
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { VideoEntity } from "./videos.entity"
import { CategoryEntity } from "./productCategory.entity"
import { FavouriteEntity } from "./likes.entity"
import { UserEntity } from "./users.entity"
import { ProductAffiliateLinkEntity } from "./product-affliateLinks"

export interface IProduct{
    id:number
    productID:string
    name:string
    price:number
    availability:ProductAvailability
    productImage:string
    stock:number
    isOutOfStock:boolean
    description:string
    createdAT:Date
    updatedAT:Date
    purchaseCount: number;
    video:VideoEntity[]
    category: CategoryEntity;
    wholesalePrice: number;
    minWholesaleQuantity: number;
    weight:number
    sku:string
    hsn:string
    hasTax:boolean
    taxRate:number
    available_sizes:string
    available_colors:string
    favourites: FavouriteEntity[]
    affiliateLink:string
    affiliateLinks: ProductAffiliateLinkEntity[];
    
    
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

    @Column('numeric', { nullable: true })
    wholesalePrice: number;
  
    @Column({ nullable: true, }) 
    minWholesaleQuantity: number;

    @Column({nullable:true})
    productImage: string


    @Column({nullable:true})
    description: string


    @Column({nullable:true})
    hsn: string


    @Column({nullable:true})
    sku: string

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

    @Column({nullable:true})
    available_colors: string

    @Column({nullable:true})
    available_sizes: string

    @Column('decimal',{nullable:true})
    weight:number

    @Column({ default: 0 })
    purchaseCount: number;

    @Column({nullable:true,type:'timestamp'})
    createdAT: Date

    @Column({nullable:true,type:'timestamp'})
    updatedAT: Date

    @Column({ nullable: true })
    affiliateLink: string;
  
    @OneToMany(() => ProductAffiliateLinkEntity, (link) => link.product)
    affiliateLinks: ProductAffiliateLinkEntity[];

    @OneToMany(()=>VideoEntity,vid=> vid.product)
    video: VideoEntity[]

    @ManyToOne(() => CategoryEntity, (category) => category.products, {nullable:true})
    category: CategoryEntity;

    @OneToMany(()=>FavouriteEntity,like=>like.product)
    favourites: FavouriteEntity[]









}
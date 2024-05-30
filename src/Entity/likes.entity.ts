import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./products.entity";
import { UserEntity } from "./users.entity";

export interface IFavourites{
    id:number
    product:ProductEntity
    user:UserEntity
    createdAt:Date
}

@Entity({name:'favouritesProducts'})
export class FavouriteEntity implements IFavourites{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=>ProductEntity, product=>product.favourites, {onDelete:'CASCADE'})
    product: ProductEntity;

    @ManyToOne(()=>UserEntity, user=>user.favourites, {onDelete:'CASCADE'})
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

}
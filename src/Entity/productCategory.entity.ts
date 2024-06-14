import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductEntity } from './products.entity';


@Entity('categories')
export class CategoryEntity implements ICategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type:'timestamp' })
  createdAT:Date

  @Column({ nullable: true, type:'timestamp' })
  updatedAT: Date;

  @Column({nullable:true})
  banner:string

  @OneToMany(() => ProductEntity, (product) => product.category,{nullable:true})
  products: ProductEntity[];
}

export interface ICategory{
    id:number
    name:string
    description:string
    createdAT:Date
    updatedAT:Date
    products:ProductEntity[]
}
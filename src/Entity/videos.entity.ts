import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ProductEntity } from "./products.entity"

export interface IVideo{
    id:string
    description:string
    duration:number
    videoType:string
    videofiles:string[]
    thumbnailUrls: string[]
    createdAT:Date
    product:ProductEntity
}

@Entity('videos')
export class VideoEntity implements IVideo{
    @PrimaryGeneratedColumn()
    id:string

    @Column({nullable:true})
    description: string

    @Column('numeric',{nullable:true})
    duration: number

    @Column({nullable:true})
    videoType: string

    @Column({nullable:true,type:'simple-array'})
    videofiles: string[]

    @Column('simple-array', { nullable: true })
    thumbnailUrls: string[];

    @Column({nullable:true,type:'timestamp'})
    createdAT: Date

    @ManyToOne(()=> ProductEntity, prd=>prd.video, {nullable:true})
    product: ProductEntity



    
}
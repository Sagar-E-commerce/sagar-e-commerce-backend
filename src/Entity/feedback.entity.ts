import { CategoryProductAvailabilitySatisfaction, LikelihoodOfWebsiteReccomendation, ProductAndImageDiscription, ProductBrowsingExperience, ShoppingExperience } from "src/Enums/all-enums";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export interface IFeedback{
    id:number
    email:string
    shoppingExperience: ShoppingExperience;
    additionalFeedback:string
    feedbackGivenAT:Date

}


@Entity({name:'feedbacks'})
export class FeddbackEntity implements IFeedback{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    email: string;

    @Column({nullable:true, type:'enum', enum:ShoppingExperience})
    shoppingExperience: ShoppingExperience;

    @Column({nullable:true})
    additionalFeedback:string

    @Column({nullable:true, type:"timestamp"})
    feedbackGivenAT: Date;


}
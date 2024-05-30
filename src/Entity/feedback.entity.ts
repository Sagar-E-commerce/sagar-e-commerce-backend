import { CategoryProductAvailabilitySatisfaction, LikelihoodOfWebsiteReccomendation, ProductAndImageDiscription, ProductBrowsingExperience, ShoppingExperience } from "src/Enums/all-enums";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export interface IFeedback{
    id:number
    email:string
    shoppingExperience:ShoppingExperience
    productBrowsingExperience:ProductBrowsingExperience
    productAndImageDiscription:ProductAndImageDiscription
    categoryProductAvailabilitySatisfaction:CategoryProductAvailabilitySatisfaction
    likelihoodOfWebSiteReccomendation:LikelihoodOfWebsiteReccomendation
    additionalSatisfactionOrFeedback:string
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

    @Column({nullable:true, type:'enum', enum:ProductBrowsingExperience})
    productBrowsingExperience: ProductBrowsingExperience;

    @Column({nullable:true, type:'enum', enum:ProductAndImageDiscription})
    productAndImageDiscription: ProductAndImageDiscription;

    @Column({nullable:true, type:'enum', enum:CategoryProductAvailabilitySatisfaction})
    categoryProductAvailabilitySatisfaction: CategoryProductAvailabilitySatisfaction;

    @Column({nullable:true, type:'enum', enum:LikelihoodOfWebsiteReccomendation})
    likelihoodOfWebSiteReccomendation: LikelihoodOfWebsiteReccomendation;

    @Column({nullable:true})
    additionalSatisfactionOrFeedback: string;

    @Column({nullable:true, type:"timestamp"})
    feedbackGivenAT: Date;


}
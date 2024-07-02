import { PaymentGateways } from "src/Enums/all-enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'payment-config'})
export class PaymentConfigurationEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: true , type:'enum', enum:PaymentGateways})
    selectedGateway: PaymentGateways;

    @CreateDateColumn()
    updatedAt:Date

}


@Entity('cashfreeTable')
export class CashFreeEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    cashfreeApiKey: string;
  
    @Column({ nullable: true })
    cashfreeApiSecret: string;

    @Column({nullable:true})
    cashfreePaymentUrl:string

    @Column({nullable:true})
    cashfreeClientId:string

    @Column({nullable:true})
    cashfreeClientSecret:string

    @Column({nullable:true})
    cashfreeWebhookSecret:string

    @Column({nullable:true})
    cashfreeAppId: string;


    @Column({nullable:true,type:'timestamp'})
    updatedAt:Date

}


@Entity('RazorPayTable')
export class RazorPayEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    razorpayApiKey: string;
  
    @Column({ nullable: true })
    razorpayApiSecret: string;

    @Column({nullable:true})
    razorpayWebhookSecret:string

    @Column({nullable:true})
    razorpayKeyId:string

    @Column({nullable:true})
    razorpayKeySecret:string

    @Column({nullable:true,type:'timestamp'})
    updatedAt:Date

}

@Entity('payUmoneyTable')
export class PayUmoneyEntity{

    @PrimaryGeneratedColumn()
    id: number;


    @Column({ nullable: true })
    payumoneyApiKey: string;
  
    @Column({ nullable: true })
    payumoneyApiSecret: string;
  
    @Column({ nullable: true })
    payumoneyMerchantId: string;

    @Column({nullable:true})
    payumoneyMerchantKey:string

    @Column({nullable:true})
    payumoneyMerchantSalt:string

    @Column({nullable:true})
    payumoneyPaymentUrl:string

    @Column({nullable:true})
    payumoneyWebhookSecret:string

    @Column({nullable:true})
    payumoneyAuthToken:string

    @Column({nullable:true,type:'timestamp'})
    updatedAt:Date

}
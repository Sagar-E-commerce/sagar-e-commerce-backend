
import {  AdminAccessLevels, AdminType, Role } from "src/Enums/all-enums";
import { IAdmin } from "src/admin/admin";
import { Column,  Entity, PrimaryGeneratedColumn, } from "typeorm";


@Entity({name:"Admin"})
export class AdminEntity implements IAdmin{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    adminID:string

    @Column({nullable:false,unique:true})
    email: string;

    @Column({nullable:false, type:'enum', enum:Role, default:Role.ADMIN})
    role:Role

    @Column({nullable:false, type:'enum', enum:AdminType})
    admintype: AdminType

    @Column({nullable:true, type:'enum', enum:AdminAccessLevels})
    adminaccessLevel: AdminAccessLevels;
    

    @Column({nullable:true})
    password: string;

    @Column({nullable:true})
    mobile: string;

    @Column({nullable:true})
    fullname: string;

    @Column({nullable:true})
    home_address:string

    @Column({nullable:true,type:'timestamp'})
    UpdatedAt:Date

    @Column({nullable:true,type:'timestamp'})
    RegisteredAt:Date
   

    @Column({nullable:true})
    profile_picture: string;
 

    @Column({nullable:true})
    gender: string;

    @Column({nullable:true})
    Nationality: string;

    @Column({nullable:true,default:false})
    isLoggedIn: boolean;

    @Column({nullable:true,default:false})
    isRegistered: boolean;

    @Column({nullable:true,default:false})
    isActivated: boolean;

    @Column({nullable:true,default:false})
    isDeactivated: boolean;

    @Column({nullable:false,default:false})
    isVerified: boolean;

    @Column({nullable:true,type:'timestamp'})
    reset_link_exptime: Date;

    @Column({nullable:true})
    password_reset_link: string;

    
    
}
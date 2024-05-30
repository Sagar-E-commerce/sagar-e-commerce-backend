import { AdminAccessLevels, AdminType, Role } from "src/Enums/all-enums"

export interface IAdmin {
    id:number
    adminID:string
    email:string
    fullname:string
    Nationality: string;
    admintype: AdminType
    adminaccessLevel:AdminAccessLevels
    mobile:string
    gender: string
    profile_picture: string
    RegisteredAt : Date
    UpdatedAt : Date
    role:Role
    isLoggedIn:boolean
    isVerified:boolean
    isRegistered:boolean
    isDeactivated:boolean
    isActivated:boolean



}
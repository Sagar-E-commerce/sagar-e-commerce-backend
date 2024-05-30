
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { AdminEntity } from "src/Entity/admin.entity"
import { UserEntity } from "src/Entity/users.entity"
import { AdminRepository } from "src/admin/admin.repository"
import { UserRepository } from "src/user/user.repository"


@Injectable()
export class AuthService{
    constructor(@InjectRepository(AdminEntity)private readonly adminrepo:AdminRepository,
    @InjectRepository(UserEntity)private readonly userrepo:UserRepository,
    ){}

    //validate user or admin by role

    async ValidateUserOrAdminByIdandRole(id:number, role:string){
        switch(role){
            case "admin":
                return await this.adminrepo.findOne({where:{id:id}})
            case "user":
                return await this.userrepo.findOne({where:{id:id}})
            
            default:
                return null
        }
    }

}
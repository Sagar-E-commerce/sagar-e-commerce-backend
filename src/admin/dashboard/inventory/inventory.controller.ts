import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { ThresholdDto, stockDto } from "src/admin/dto/otherDto";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAccessLevels, Role } from "src/Enums/all-enums";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";

@UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard)
@Roles(Role.ADMIN)
@AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)


@Controller('inventory')
export class InventoryController{
    constructor(private readonly inventoryservice:InventoryService){}

    @Patch('restock/:productID')
    async RestockProdcuct(@Body()dto:stockDto, @Param('productID')productID:number){
        return await this.inventoryservice.RestockProduct(dto,productID)
    }

    @Patch('adjust-stock/:productID')
    async AdjustProdcuctStock(@Body()dto:stockDto, @Param('productID')productID:number){
        return await this.inventoryservice.AdjustProductStock(dto,productID)
    }

    @Get('get-low-stock')
    async LowStockTreshhold(@Body()dto:ThresholdDto){
        return await this.inventoryservice.getLowStockProducts(dto)
    }
}
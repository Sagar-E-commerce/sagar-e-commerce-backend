import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductMgtService } from "./product.mgt.service";
import { CreateCategoryDto, CreateProductDto, UpdateCategoryDto, UpdateProductDto, uploadVideoDto } from "src/admin/dto/otherDto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleGuard } from "src/auth/guard/role.guard";
import { Roles } from "src/auth/decorator/role.decorator";
import { AdminAccessLevels, Role } from "src/Enums/all-enums";
import { AdminAcessLevelGuard } from "src/auth/guard/accesslevel.guard";
import { AdminAccessLevel } from "src/auth/decorator/accesslevel.decorator";

@UseGuards(JwtGuard,RoleGuard,AdminAcessLevelGuard)
@Roles(Role.ADMIN)
@AdminAccessLevel(AdminAccessLevels.LEVEL3,AdminAccessLevels.LEVEL2,AdminAccessLevels.LEVEL1)

@Controller('product-mgt')
export class ProductMgtController{
    constructor(private productngtservice:ProductMgtService){}

    @Post('upload-product-video')
    @UseInterceptors(FilesInterceptor('media',10))
    async UploadVideo(@UploadedFiles()files:Express.Multer.File[],@Body()dto:uploadVideoDto){

    // Separate video and thumbnail files
    const videofiles = files.filter(file => file.mimetype.startsWith('video/'));
    const thumbnailFiles = files.filter(file => file.mimetype.startsWith('image/'))
    
      return await this.productngtservice.UploadProductVidoes(videofiles,thumbnailFiles,dto)
    }
    

    @Delete('take-down-video/:videoID')
    async TakeDownVideo(@Param('videoID')videoID:string){
        return await this.productngtservice.TakeDownVideo(videoID)
    }


    @Get('fetch-all-videos')
    async FetchAllVideo(@Query('page')page:number,@Query('limit')limit:number){
        return await this.productngtservice.fetchAllVideos(page,limit)
    }


    @Post('new-product')
    @UseInterceptors(FileInterceptor('image'))
    async CreateNewProduct(@Body()dto:CreateProductDto, @UploadedFile()file:Express.Multer.File){
        return await this.productngtservice.CreateProduct(dto,file)
    }


    @Patch('edit-product/:productID')
    @UseInterceptors(FileInterceptor('image'))
    async EditProductDetails(@Param('productID')productID:number,@Body()dto:UpdateProductDto, @UploadedFile()file:Express.Multer.File){
        return await this.productngtservice.EditProductDetails(productID,dto,file)
    }


    @Delete('take-down-product/:productID')
    async TakeDownProduct(@Param('productID')productID:number){
        return await this.productngtservice.TakeDownAProduct(productID)
    }

    @Get('fetch-all-products')
    async FetchAllProduct(@Query('page')page:number,@Query('limit')limit:number){
        return await this.productngtservice.fetchAllProducts(page,limit)
    }

    @Get('fetch-one-product/:productID')
    async FetchOneProduct(@Param('productID')productID:number){
        return await this.productngtservice.fetchOneProduct(productID)
    }


    @Post('new-product-category')
    @UseInterceptors(FileInterceptor('banner'))
    async CreateNewProductCategory(@Body()dto:CreateCategoryDto, @UploadedFile()file:Express.Multer.File){
        return await this.productngtservice.createCategory(dto,file)
    }

    @Patch('update-product-category/:categoryID')
    @UseInterceptors(FileInterceptor('banner'))
    async UpdateProductCategory(@Body()dto:UpdateCategoryDto, @Param('categoryID')categoryID:number, @UploadedFile()file:Express.Multer.File){
        return await this.productngtservice.updateCategory(dto,categoryID,file)
    }

    @Get('fetch-all-product-category')
    async FetchAllCategories(@Query('page')page:number,@Query('limit')limit:number){
        return await this.productngtservice.getAllCategory(page,limit)
    }

    @Get('fetch-one-product/:categoryID')
    async FetchOneCategory(@Param('categoryID')categoryID:number){
        return await this.productngtservice.getOneCategory(categoryID)
    }

    @Delete('delete-product-category/:categoryID')
    async deleteCategory(@Param('categoryID')categoryID:number){
        return await this.productngtservice.DeleteCategory(categoryID)
    }

    


}
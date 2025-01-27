import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { Notifications } from 'src/Entity/notifications.entity';
import { CategoryEntity, ICategory } from 'src/Entity/productCategory.entity';
import { IProduct, ProductEntity } from 'src/Entity/products.entity';
import { IVideo, VideoEntity } from 'src/Entity/videos.entity';
import { ProductAvailability } from 'src/Enums/all-enums';
import {
  CategoryRepository,
  VideoRepository,
} from 'src/admin/admin.repository';
import {
  CreateCategoryDto,
  CreateProductDto,
  UpdateCategoryDto,
  UpdateProductDto,
  uploadVideoDto,
} from 'src/admin/dto/otherDto';
import {
  NotificationRepository,
  ProductRepository,
} from 'src/common/common.repositories';
import { CloudinaryService } from 'src/common/services/claudinary.service';
import { GeneatorService } from 'src/common/services/generator.service';
import { UploadService } from 'src/common/services/upload.service';

@Injectable()
export class ProductMgtService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: ProductRepository,
    @InjectRepository(Notifications)
    private readonly notficationrepo: NotificationRepository,
    @InjectRepository(VideoEntity)
    private readonly videorepo: VideoRepository,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: CategoryRepository,
    private uploadservice: UploadService,
    private generatorservice: GeneatorService,
    private cloudinaryservice: CloudinaryService,
  ) {}

  async UploadProductVidoes(
    videofiles: Express.Multer.File[],
    thumbnailFiles: Express.Multer.File[],
    dto: uploadVideoDto,
  ): Promise<IVideo> {
    try {
      //find product
      const product = await this.productRepo.findOne({
        where: { id: dto.productID },
        relations: ['video'],
      });
      if (!product)
        throw new NotFoundException(
          `product with ${dto.productID} is not found`,
        );

      const videofileUrls: string[] = [];
      const thumbnailUrls: string[] = [];
      let Videoduration: number;
      let videoType: string;

      // Handle video file uploads
      // for (const vidfile of videofiles) {
      //   try {
      //     const {
      //       url,
      //       duration,
      //       type
      //     } = await this.uploadservice.uploadVideoFile(vidfile);
      //     videofileUrls.push(`${process.env.BASE_URL}/public/${url}`);
      //     Videoduration = duration;
      //     videoType = type
      //   } catch (error) {
      //     throw new InternalServerErrorException(
      //       'Failed to upload video file',
      //       error,
      //     );
      //   }
      // }

      // Handle video file uploads with cloudinary
      for (const vidfile of videofiles) {
        try {
          const result = await this.cloudinaryservice.uploadVideoFile(vidfile);
          videofileUrls.push(result.secure_url);
          Videoduration = result.duration;
          videoType = result.format;
        } catch (error) {
          throw new InternalServerErrorException(
            'Failed to upload video file',
            error.message,
          );
        }
      }

      // Handle thumbnail uploads
      for (const thumbFile of thumbnailFiles) {
        try {
          const result =
            await this.cloudinaryservice.uploadThumbnail(thumbFile);
          thumbnailUrls.push(result.secure_url);
        } catch (error) {
          throw new InternalServerErrorException(
            'Failed to upload thumbnail',
            error.message,
          );
        }
      }

      const video = new VideoEntity();
      video.product = product;
      video.description = dto.description;
      video.duration = Videoduration;
      video.videoType = videoType;
      video.videofiles = videofileUrls;
      video.thumbnailUrls = thumbnailUrls;
      video.createdAT = new Date();

      await this.videorepo.save(video);

      return video;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to upload a product video ',
          error.message,
        );
      }
    }
  }

  //takedown video
  async TakeDownVideo(videoID: string) {
    try {
      const video = await this.videorepo.findOne({
        where: { id: videoID },
        relations: ['product'],
      });
      if (!video) throw new NotFoundException('video not found');

      if (video.product) {
        video.product.video = null;
        await this.productRepo.save(video.product);
      }

      await this.videorepo.remove(video);

      return {
        message: `video with ID ${videoID} have been successfully deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to delete video ',
        );
      }
    }
  }

  //fetch all products
  async fetchAllVideos(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const products = await this.videorepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['product'],
      });
      if (products[1] === 0)
        throw new NotFoundException(
          'no products have been video at the moment',
        );

      return products;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',
          error.message,
        );
      }
    }
  }

  async CreateProduct(
    dto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<IProduct> {
    try {
    

      // Handle image file uploads to Cloudinary
      
      const display_pics = await this.cloudinaryservice.uploadFile(file);
      const productImage = display_pics.secure_url;

    

      // create post
      const product = new ProductEntity();
      product.name = dto.name;
      product.productID = `#TgmPr${await this.generatorservice.generateProductID()}`;
      product.hsn = await this.generatorservice.generateHSNCode()
      product.sku = await this.generatorservice.generateSKUCode()
      product.description = dto.description;
      product.productImage = productImage;
      product.price = dto.price;
      product.stock = dto.stock;
      product.weight = dto.weight
      product.wholesalePrice = dto.wholesalePrice;
      product.minWholesaleQuantity = dto.minWholesaleQuantity;
      product.available_colors = dto.available_colors;
      product.available_sizes = dto.available_sizes;
      product.hasTax = dto.hasTax ?? false;
      product.taxRate = dto.taxRate ?? 1.0;

      // Find and set category
      if (dto.categoryId) {
        const category = await this.categoryRepo.findOne({
          where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');
        product.category = category;
      }

      //to determine availablity
      if (dto.stock <= 0) {
        product.availability = ProductAvailability.OUT_OF_STOCK;
        product.isOutOfStock = true;
      } else {
        product.availability = ProductAvailability.IN_STOCK;
        product.isOutOfStock = false;
      }

      product.createdAT = new Date();

      await this.productRepo.save(product);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product Created!';
      notification.message = `Product with ${product.productID} have been created successfully `;
      await this.notficationrepo.save(notification);

      return product;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to post a product ',
          error.message,
        );
      }
    }
  }

  // edit products
  async EditProductDetails(
    productID: number,
    dto: UpdateProductDto,
    file: Express.Multer.File,
  ): Promise<IProduct> {
    try {
      //find product
      const product = await this.productRepo.findOne({
        where: { id: productID },
      });
      if (!product)
        throw new NotFoundException(`product with ${productID} is not found`);

    

      //update product
        // If a new file is provided, upload it and update the banner URL
        if (file) {
          const display_pics = await this.cloudinaryservice.uploadFile(file);
          product.productImage = display_pics.secure_url;
        }
      product.name = dto.name;
      product.description = dto.description;
      product.price = dto.price;
      product.stock = dto.stock;
     
      product.wholesalePrice = dto.wholesalePrice;
      product.minWholesaleQuantity = dto.minWholesaleQuantity;
      product.hasTax = dto.hasTax;
      product.taxRate = dto.taxRate;
      product.available_colors = dto.available_colors;
      product.available_sizes = dto.available_sizes;

      // Find and set category
      if (dto.categoryId) {
        const category = await this.categoryRepo.findOne({
          where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');
        product.category = category;
      }

      //to determine availablity
      if (dto.stock <= 0) {
        product.availability = ProductAvailability.OUT_OF_STOCK;
        product.isOutOfStock = true;
      } else {
        product.availability = ProductAvailability.IN_STOCK;
        product.isOutOfStock = false;
      }

      product.updatedAT = new Date();
      await this.productRepo.save(product);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product Details Updated!';
      notification.message = `Product details of Product with ${product.productID} have been updated successfully `;
      await this.notficationrepo.save(notification);

      return product;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update product details ',
          error.message,
        );
      }
    }
  }

  //takedown product
  async TakeDownAProduct(productID: number) {
    try {
      const products = await this.productRepo.findOne({
        where: { id: productID },
        relations: ['category'],
      });
      if (!products)
        throw new NotFoundException(
          'no products have been posted at the moment',
        );

      if (products.category) {
        products.category.products = null;
        await this.categoryRepo.save(products.category);
      }

      

      await this.productRepo.remove(products);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product TakenDown!';
      notification.message = `Product with Product with ${products.productID} have been deleted successfully `;
      await this.notficationrepo.save(notification);

      return {
        message: `product with ID ${productID} have been successfully deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',
          error.message,
        );
      }
    }
  }

  //fetch all products
  async fetchAllProducts(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const products = await this.productRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['video', 'category', 'favourites'],
      });
      if (products[1] === 0)
        throw new NotFoundException(
          'no products have been posted at the moment',
        );

      return products;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',
          error.message,
        );
      }
    }
  }

  //fetch all products
  async fetchOneProduct(productID: number) {
    try {
      const products = await this.productRepo.findOne({
        where: { id: productID },
        relations: ['category', 'video', 'likes'],
      });
      if (!products)
        throw new NotFoundException(
          'no products have been posted at the moment',
        );

      return products;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',
          error.message,
        );
      }
    }
  }

  async createCategory(
    dto: CreateCategoryDto,
    file: Express.Multer.File,
  ): Promise<ICategory> {
    try {
      const display_pics = await this.cloudinaryservice.uploadFile(file);
      const categorybanner = display_pics.secure_url;

      //check for name uniqueness
      const categoryName = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (categoryName)
        throw new ConflictException(
          'category name already exists, please create another one or delete the previous one first',
        );

      // create new category
      const category = new CategoryEntity();
      category.description = dto.description;
      category.name = dto.name;
      category.createdAT = new Date();
      category.banner = categorybanner;
      await this.categoryRepo.save(category);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product category Created!';
      notification.message = `A Product category  have been created successfully `;
      await this.notficationrepo.save(notification);

      return category;
    } catch (error) {
      if (error instanceof ConflictException)
        throw new ConflictException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to create product category ',
          error.message,
        );
      }
    }
  }

  async updateCategory(
    dto: UpdateCategoryDto,
    categoryID: number,
    file: Express.Multer.File,
  ): Promise<ICategory> {
    try {
      //check for name uniqueness
      const category = await this.categoryRepo.findOne({
        where: { id: categoryID },
      });
      if (!category) throw new NotFoundException('category not found');

      // updatecategory

      // If a new file is provided, upload it and update the banner URL
      if (file) {
        const display_pics = await this.cloudinaryservice.uploadFile(file);
        category.banner = display_pics.secure_url;
      }

      category.description = dto.description;
      category.name = dto.name;
      category.updatedAT = new Date();

      await this.categoryRepo.save(category);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product category Updated!';
      notification.message = `A Product category with ${category.id}  have been updated successfully `;
      await this.notficationrepo.save(notification);
      return category;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to update this  product category ',
          error.message,
        );
      }
    }
  }

  async getAllCategory(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const categories = await this.categoryRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['products'],
      });

      if (categories[1] === 0)
        throw new NotFoundException(' there are no categories at the moment');

      return categories;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all products ',
          error.message,
        );
      }
    }
  }

  async getOneCategory(categoryID: number): Promise<ICategory> {
    try {
      const categories = await this.categoryRepo.findOne({
        where: { id: categoryID },
        relations: ['products'],
      });

      if (!categories)
        throw new NotFoundException(' there are no category with the id found');

      return categories;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to one product category ',
          error.message,
        );
      }
    }
  }

  async DeleteCategory(categoryID: number) {
    try {
      const categories = await this.categoryRepo.findOne({
        where: { id: categoryID },
        relations: ['products'],
      });

      if (!categories)
        throw new NotFoundException(' there are no category with the id found');

      if (categories.products && categories.products.length > 0) {
        for (const product of categories.products) {
          product.category = null;
          await this.productRepo.save(product);
        }
      }

      await this.categoryRepo.remove(categories);

      //save the notification
      const notification = new Notifications();
      notification.account = 'admin';
      notification.subject = 'Product category Deleted!';
      notification.message = `A Product category with ${categories.id}  have been deleted successfully `;
      await this.notficationrepo.save(notification);

      return { message: 'product category successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to one product category ',
          error.message,
        );
      }
    }
  }

  //product count , category count , total stock count  

  async ProductCount():Promise<number>{
    const count = await this.productRepo.count()
    return count
  }

  async CategoryCount():Promise<number>{
    const count = await this.categoryRepo.count()
    return count
  }

  async PrdoductStockcount(): Promise<number> {
    const products = await this.productRepo.find();
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    return totalStock;
  }

}

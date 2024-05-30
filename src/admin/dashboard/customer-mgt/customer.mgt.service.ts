import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeddbackEntity } from 'src/Entity/feedback.entity';
import { NewsLetterEntity } from 'src/Entity/newsletter.entity';
import { UserEntity } from 'src/Entity/users.entity';
import { IUser } from 'src/user/user';
import { FeedBackRepository, NewsletterRepository, UserRepository } from 'src/user/user.repository';
import { Like } from 'typeorm';

@Injectable()
export class CustomerMgtService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: UserRepository,
    @InjectRepository(NewsLetterEntity)
    private readonly newsletterripo: NewsletterRepository,
    @InjectRepository(FeddbackEntity)
    private readonly feedbackripo: FeedBackRepository,
  ) {}

  //get all customers
  async getAllUsers(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const users = await this.userRepo.findAndCount({
        skip: skip,
        take: limit,
        relations: ['orders','favourites'],
      });

      if (users[1] === 0)
        throw new NotFoundException('there are no users at the moment');
      return users;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while tying to fetch all users, please try again later',error.message,
        );
      }
    }
  }

  //get a customer
  async getOneUser(userID: number): Promise<IUser> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userID },
        relations: ['orders','favourites'],
      });

      if (!user) throw new NotFoundException('this user is not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while tying to fetch all users, please try again later',error.message,
        );
      }
    }
  }

  //delete a customer
  async deleteOneUser(userID: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userID },
        relations: ['orders','favourites'],
      });

      if (!user) throw new NotFoundException('this user is not found');
      await this.userRepo.remove(user);
      return {
        message: `${user.fullname} have been successfully deleted by the admin`,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while tying to fetch all users, please try again later',error.message,
        );
      }
    }
  }

  //search users

  async searchUsers(keyword: string): Promise<IUser[]> {
    try {
      // Build query criteria
      const criteria: any = {};

      if (keyword) {
        criteria.fullname = Like(`%${keyword}%`);
      }

     

      // Search user
      const user = await this.userRepo.find({
        where: criteria,
        relations: ['orders','favourites'],
      });

      if (!user) throw new NotFoundException('user not found');

      return user;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.error('Error searching user:', error);
        throw new InternalServerErrorException('Failed to search for user ',error.message);
      }
    }
  }

  async GetAllNewsLetterSubscribers(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const subscribers = await this.newsletterripo.findAndCount({
        take: limit,
        skip: skip,
      });

      if (subscribers[1] === 0)
      throw new NotFoundException(
        'you have no news letter sunscribers  at the moment',
      );
      return subscribers;
    } catch (error) {

       if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all news letter, please try again later',error.message,
        );
      }
    }
  }


  async GetAllFeedbacks(page: number = 1, limit: number = 30) {
    try {
      const skip = (page - 1) * limit;
      const subscribers = await this.feedbackripo.findAndCount({
        take: limit,
        skip: skip,
      });

      if (subscribers[1] === 0)
      throw new NotFoundException(
        'you have no feedbacks  at the moment',
      );
      return subscribers;
    } catch (error) {

       if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else {
        console.log(error);
        throw new InternalServerErrorException(
          'something went wrong while trying to fetch all feedbacks, please try again later',error.message,
        );
      }
    }
  }

  //resolve complaint
}

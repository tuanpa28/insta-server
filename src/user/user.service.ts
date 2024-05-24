import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto, FindOptionsDto, UpdateUserDto } from './dtos';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  findAll(options: any): Promise<User[]> {
    const { skip, limit, sort, ...params } = options;
    return this.userModel
      .find(params)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  findOneOptions(options: FindOptionsDto) {
    const query = {
      [options.field]: options.payload,
    };
    return this.userModel.findOne(query).exec();
  }

  findListOptions({ field, payload }: FindOptionsDto, options: any) {
    const { skip, limit, sort, ...params } = options;
    const query = {
      [field]: payload,
      ...params,
    };
    return this.userModel.find(query).sort(sort).skip(skip).limit(limit);
  }

  findAggregate(query: Array<any>) {
    return this.userModel.aggregate(query).exec();
  }

  countDocuments(query = {}) {
    return this.userModel.countDocuments(query).exec();
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  update(id: string, updateEmployeeDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateEmployeeDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}

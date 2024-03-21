import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreatePostDto, FindOptionsDto, UpdatePostDto } from './dtos';
import { Post, PostDocument } from './schema/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  findOne(id: string) {
    return this.postModel.findById(id);
  }

  findAll(options: any): Promise<Post[]> {
    const { skip, limit, sort, ...params } = options;
    return this.postModel
      .find(params)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  findOneOptions(options: FindOptionsDto): Promise<Post> {
    const query = {
      [options.field]: options.payload,
    };
    return this.postModel.findOne(query);
  }

  findListOptions({ field, payload }: FindOptionsDto, options?: any): any {
    const { skip, limit, sort, ...params } = options;
    const query = {
      [field]: payload,
      ...params,
    };
    return this.postModel.find(query).sort(sort).skip(skip).limit(limit);
  }

  countDocuments() {
    return this.postModel.countDocuments();
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdUser = new this.postModel(createPostDto);
    return createdUser.save();
  }

  update(id: string, updateEmployeeDto: UpdatePostDto): Promise<Post> {
    return this.postModel.findByIdAndUpdate(id, updateEmployeeDto);
  }

  remove(id: string): Promise<any> {
    return this.postModel.findByIdAndDelete(id);
  }
}

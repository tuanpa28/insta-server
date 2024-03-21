import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCommentDto, FindOptionsDto, UpdateCommentDto } from './dtos';
import { Comment, CommentDocument } from './schema/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  findOne(id: string) {
    return this.commentModel.findById(id);
  }

  findAll(options: any): Promise<Comment[]> {
    const { skip, limit, sort, ...params } = options;
    return this.commentModel
      .find(params)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneOptions(options: FindOptionsDto) {
    const query = {
      [options.field]: options.payload,
    };
    return this.commentModel.findOne(query);
  }

  findListOptions({ field, payload }: FindOptionsDto, options?: any) {
    const { skip, limit, sort, ...params } = options;
    const query = {
      [field]: payload,
      ...params,
    };
    return this.commentModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  countDocuments() {
    return this.commentModel.countDocuments();
  }

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    return createdComment.save();
  }

  update(id: string, updateEmployeeDto: UpdateCommentDto): Promise<Comment> {
    return this.commentModel.findByIdAndUpdate(id, updateEmployeeDto);
  }

  remove(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}

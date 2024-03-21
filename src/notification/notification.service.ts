import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CreateNotificationDto,
  FindOptionsDto,
  UpdateNotificationDto,
} from './dtos';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';

@Injectable()
export class NotifiService {
  constructor(
    @InjectModel(Notification.name)
    private NotifiModel: Model<NotificationDocument>,
  ) {}

  findOne(id: string) {
    return this.NotifiModel.findById(id);
  }

  findAll(options: any): Promise<Notification[]> {
    const { skip, limit, sort, ...params } = options;
    return this.NotifiModel.find(params)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneOptions(options: FindOptionsDto) {
    const query = {
      [options.field]: options.payload,
    };
    return this.NotifiModel.findOne(query);
  }

  countDocuments() {
    return this.NotifiModel.countDocuments();
  }

  async create(createNotifiDto: CreateNotificationDto): Promise<Notification> {
    const createdNotifi = new this.NotifiModel(createNotifiDto);
    return createdNotifi.save();
  }

  update(
    id: string,
    updateEmployeeDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.NotifiModel.findByIdAndUpdate(id, updateEmployeeDto);
  }

  remove(id: string) {
    return this.NotifiModel.findByIdAndDelete(id);
  }
}

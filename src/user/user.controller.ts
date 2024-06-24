import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

import { SkipAuthAdminGuard } from '@/auth/decorators';
import { AdminGuard, AuthGuard } from '@/auth/guards';
import { ACCESS_TOKEN_NAME } from '@/libs/common/constants';
import { ChangePasswordDto, SearchUserDto, UserDto } from './dtos';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
@UseGuards(AuthGuard, AdminGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user list' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME) // This is the one that needs to match the name in main.ts
  @SkipAuthAdminGuard()
  async findAll(@Query() query: any) {
    try {
      const {
        page = 1,
        limit = 10,
        _sort = 'createdAt',
        _order = 'asc',
        ...params
      } = query;

      const options = {
        skip: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
        sort: {
          [_sort]: _order === 'desc' ? -1 : 1,
        },
        ...params,
      };

      const [users, count] = await Promise.all([
        this.userService.findAll(options),
        this.userService.countDocuments(),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: users,
        currentPage: Number(page),
        totalPage: Math.ceil(count / Number(limit)),
        totalDocs: count,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':username/username')
  @ApiOperation({ summary: 'Get user by userName' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findOneByUserName(@Param('username') username: string) {
    try {
      const pipeline = [
        {
          $match: {
            username,
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'user_id',
            as: 'posts',
          },
        },
        {
          $addFields: {
            totalPosts: { $size: '$posts' },
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            full_name: 1,
            profile_image: 1,
            bio: 1,
            date_of_birth: 1,
            gender: 1,
            current_city: 1,
            from: 1,
            followers: 1,
            followings: 1,
            tick: 1,
            createdAt: 1,
            totalPosts: 1,
          },
        },
      ];

      const user = await this.userService.findAggregate(pipeline);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: user[0],
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UserDto) {
    try {
      const user = await this.userService.update(id, updateEmployeeDto);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async remove(@Param('id') id: string) {
    try {
      await this.userService.remove(id);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('follow/:id')
  @ApiOperation({ summary: 'Follow user by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async followUser(@Param('id') id: string, @Req() req: any) {
    const { _id: user_id } = req.user;
    try {
      if (user_id !== id) {
        const [user, currentUser] = await Promise.all([
          this.userService.findOne(id),
          this.userService.findOne(user_id),
        ]);

        if (!user.followers.includes(user_id)) {
          await user.updateOne({ $push: { followers: user_id } });
          await currentUser.updateOne({ $push: { followings: id } });
          return {
            isError: false,
            statusCode: HttpStatus.OK,
            message: 'User has been followed!',
          };
        } else {
          await user.updateOne({ $pull: { followers: user_id } });
          await currentUser.updateOne({ $pull: { followings: id } });
          return {
            isError: false,
            statusCode: HttpStatus.OK,
            message: 'User has been unfollowed!',
          };
        }
      } else {
        return {
          isError: true,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'You cant follow youself!',
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('suggested/results')
  @ApiOperation({ summary: 'Get user suggested' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async getUserSuggested(@Query() query: any, @Req() req: any) {
    const { _id: user_id, followings } = req.user;
    const userId = new ObjectId(user_id as string);
    const followingsObjectId = followings.map(
      (following: string) => new ObjectId(following),
    );

    const {
      page = 1,
      limit = 5,
      _sort = 'createdAt',
      _order = 'asc',
      ...params
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = {
      [_sort]: _order === 'desc' ? -1 : 1,
    };
    try {
      const matchCondition = {
        $and: [
          {
            _id: { $ne: userId, $nin: followingsObjectId },
          },
          {
            $or: [
              { followers: { $in: followingsObjectId } },
              { followings: { $in: followingsObjectId } },
            ],
          },
        ],
        ...params,
      };

      const pipeline = [
        {
          $match: matchCondition,
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(limit),
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'user_id',
            as: 'posts',
          },
        },
        {
          $addFields: {
            totalPosts: { $size: '$posts' },
            recentImages: {
              $slice: [
                {
                  $reduce: {
                    input: {
                      $filter: {
                        input: '$posts',
                        as: 'post',
                        cond: { $gt: [{ $size: '$$post.media' }, 0] },
                      },
                    },
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        '$$value',
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: '$$this.media',
                                as: 'media',
                                cond: { $eq: ['$$media.type', 'image'] },
                              },
                            },
                            as: 'media',
                            in: '$$media.url',
                          },
                        },
                      ],
                    },
                  },
                },
                -3,
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            full_name: 1,
            profile_image: 1,
            bio: 1,
            current_city: 1,
            from: 1,
            followers: 1,
            followings: 1,
            tick: 1,
            createdAt: 1,
            totalPosts: 1,
            recentImages: 1,
          },
        },
      ];

      const [suggestedUsers, countResult] = await Promise.all([
        this.userService.findAggregate(pipeline),
        this.userService.countDocuments(matchCondition),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: suggestedUsers,
        currentPage: Number(page),
        totalPage: Math.ceil(countResult / Number(limit)),
        totalDocs: countResult,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/results')
  @ApiOperation({ summary: 'Search user' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async searchUser(@Query() query: SearchUserDto) {
    const {
      q = '',
      page = 1,
      limit = 12,
      _sort = 'createdAt',
      _order = 'asc',
      ...params
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = {
      [_sort]: _order === 'desc' ? -1 : 1,
    };

    try {
      const matchCondition = {
        $text: {
          $search: q,
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
        ...params,
      };

      const pipeline = [
        {
          $match: matchCondition,
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            full_name: 1,
            profile_image: 1,
            followers: 1,
            followings: 1,
            tick: 1,
          },
        },
      ];

      const [users, count] = await Promise.all([
        this.userService.findAggregate(pipeline),
        this.userService.countDocuments(matchCondition),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: users,
        currentPage: Number(page),
        totalPage: Math.ceil(count / Number(limit)),
        totalDocs: count,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('followers/results')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async getFollowers(@Req() req: any) {
    const { _id } = req.user;
    const userId = new ObjectId(_id as string);
    try {
      const pipeline = [
        {
          $match: { _id: userId },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'followers',
            foreignField: '_id',
            as: 'followers',
          },
        },
        {
          $project: {
            username: 1,
            email: 1,
            full_name: 1,
            profile_image: 1,
            followers: {
              _id: 1,
              username: 1,
              email: 1,
              full_name: 1,
              profile_image: 1,
              bio: 1,
              current_city: 1,
              tick: 1,
            },
          },
        },
      ];

      const [user] = await this.userService.findAggregate(pipeline);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('followings/results')
  @ApiOperation({ summary: 'Get user followings' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async getFollowings(@Req() req: any) {
    const { _id } = req.user;
    const userId = new ObjectId(_id as string);
    try {
      const pipeline = [
        {
          $match: { _id: userId },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'followings',
            foreignField: '_id',
            as: 'followings',
          },
        },
        {
          $project: {
            username: 1,
            email: 1,
            full_name: 1,
            profile_image: 1,
            followings: {
              _id: 1,
              username: 1,
              email: 1,
              full_name: 1,
              profile_image: 1,
              bio: 1,
              current_city: 1,
              tick: 1,
            },
          },
        },
      ];

      const [user] = await this.userService.findAggregate(pipeline);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('change/password')
  @ApiOperation({ summary: 'Change account password' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async changePassword(@Body() body: ChangePasswordDto, @Req() req: any) {
    const { _id: user_id } = req.user;
    const { password, new_password } = body;
    try {
      const user = await this.userService.findOne(user_id);

      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản!');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu cũ không hợp lệ!');
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await this.userService.update(user_id, {
        password: hashedPassword,
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

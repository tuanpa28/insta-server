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

import { AdminGuard, AuthGuard } from '@/auth/guards';
import { ACCESS_TOKEN_NAME } from '@/libs/common/constants';
import { SkipAuthAdminGuard } from '@/auth/decorators';
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
        skip: (page - 1) * limit,
        limit,
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
        currentPage: page,
        totalPage: Math.ceil(count / limit),
        totalDocs: users.length,
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
    const { page = 1, limit = 5, ...params } = query;

    const options = {
      skip: (page - 1) * limit,
      limit,
      ...params,
    };
    try {
      const suggestedUsers = await this.userService
        .findListOptions(
          {
            field: '$and',
            payload: [
              {
                _id: { $ne: user_id, $nin: followings },
                $or: [
                  { followers: { $in: followings } },
                  { followings: { $in: followings } },
                ],
              },
            ],
          },
          options,
        )
        .exec();

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: suggestedUsers,
        currentPage: page,
        // totalPage: Math.ceil(count / limit),
        totalDocs: suggestedUsers.length,
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
    const { q = '', ...params } = query;

    const options = {
      ...params,
    };

    try {
      const users = await this.userService
        .findListOptions(
          {
            field: '$text',
            payload: {
              $search: q,
              $caseSensitive: false,
              $diacriticSensitive: false,
            },
          },
          options,
        )
        .select('username email full_name profile_image tick')
        .exec();

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: users,
        totalDocs: users.length,
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
    const { _id: user_id } = req.user;
    try {
      const user = await this.userService.findOne(user_id).populate({
        path: 'followers',
        select: 'username email full_name profile_image bio current_city',
      });

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
    const { _id: user_id } = req.user;
    try {
      const user = await this.userService.findOne(user_id).populate({
        path: 'followings',
        select: 'username email full_name profile_image bio current_city',
      });

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
    const { _id: user_id, password: currentPassword } = req.user;
    const { password, new_password } = body;
    try {
      const isMatch = await bcrypt.compare(password, currentPassword);
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

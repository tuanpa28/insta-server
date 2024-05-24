import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { SkipAuthAdminGuard } from '@/auth/decorators';
import { AdminGuard, AuthGuard } from '@/auth/guards';
import { ACCESS_TOKEN_NAME } from '@/libs/common/constants';
import { CreatePostDto, UpdatePostDto } from './dtos';
import { PostService } from './post.service';

@Controller('post')
@ApiTags('Post')
@UseGuards(AuthGuard, AdminGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  @ApiOperation({ summary: 'Get post list' })
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

      const [posts, count] = await Promise.all([
        this.postService.findAll(options),
        this.postService.countDocuments(),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: posts,
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
  @ApiOperation({ summary: 'Get post by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findOne(@Param('id') id: string) {
    try {
      const post = await this.postService.findOne(id);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: post,
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

  @Get(':slug/slug')
  @ApiOperation({ summary: 'Get post by slug' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findOneBySlug(@Param('slug') slug: string) {
    try {
      const post = await this.postService.findOneOptions({
        field: 'slug',
        payload: slug,
      });
      if (!post)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Post not found!',
        };

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: post,
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

  @Post()
  @ApiOperation({ summary: 'Create new post' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async create(@Body() createEmployeeDto: CreatePostDto, @Req() req: any) {
    const { _id: user_id } = req.user;
    const data = { ...createEmployeeDto, user_id };
    try {
      const post = await this.postService.create(data);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: post,
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
  @ApiOperation({ summary: 'Update post by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdatePostDto,
  ) {
    try {
      const post = await this.postService.update(id, updateEmployeeDto);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: post,
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
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async remove(@Param('id') id: string) {
    try {
      await this.postService.remove(id);

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

  @Put(':id/like')
  @ApiOperation({ summary: 'Like post' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async likePost(@Req() req: any, @Param('id') id: string) {
    try {
      const { _id: user_id } = req.user;

      const post = await this.postService.findOne(id);

      const updateAction = post.likes.includes(user_id)
        ? { $pull: { likes: user_id } }
        : { $push: { likes: user_id } };

      await post.updateOne(updateAction);

      const message = post.likes.includes(user_id)
        ? 'The post has been unliked!'
        : 'You have liked the post!';

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message,
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

  @Put(':id/share')
  @ApiOperation({ summary: 'Share post' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async sharePost(@Req() req: any, @Param('id') id: string) {
    try {
      const { _id: user_id } = req.user;

      const post = await this.postService.findOne(id);
      if (!post)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Post not found!',
        };

      await post.updateOne({
        $push: { shares: { user_id, date: new Date() } },
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'The post has been share!',
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

  @Get('timeline/results')
  @ApiOperation({ summary: 'Get post list on time line' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async postsOnTimeline(@Query() query: any, @Req() req: any) {
    try {
      const { _id: user_id, followings } = req.user;
      const userId = new ObjectId(user_id as string);
      const followingsObjectId = followings.map(
        (following: string) => new ObjectId(following),
      );
      const {
        page = 1,
        limit = 10,
        _sort = 'createdAt',
        _order = 'asc',
        ...params
      } = query;

      const { skip, sort } = {
        skip: (Number(page) - 1) * Number(limit),
        sort: {
          [_sort]: _order === 'desc' ? -1 : 1,
        },
      };

      const matchCondition = {
        $or: [{ user_id: userId }, { user_id: { $in: followingsObjectId } }],
        ...params,
      };

      const pipeline = [
        {
          $match: matchCondition,
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            caption: 1,
            media: 1,
            likes: 1,
            shares: 1,
            slug: 1,
            createdAt: 1,
            'user.username': 1,
            'user.profile_image': 1,
            'user.full_name': 1,
            'user.followers': 1,
            'user.followings': 1,
            'user.createdAt': 1,
          },
        },
      ];

      const [friendPosts, count] = await Promise.all([
        this.postService.findAggregate(pipeline),
        this.postService.countDocuments(matchCondition),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: friendPosts,
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

  @Get(':id/user')
  @ApiOperation({ summary: 'Get All Post For One User' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findAllPostForOneUser(@Param('id') user_id: string) {
    const userId = new ObjectId(user_id);
    try {
      const posts = await this.postService.findAggregate([
        {
          $match: { user_id: userId },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            caption: 1,
            media: 1,
            likes: 1,
            shares: 1,
            slug: 1,
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'user.full_name': 1,
          },
        },
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: posts,
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

  @Get('medias/results')
  @ApiOperation({ summary: 'Get All Media Posts User' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findAllMediaPostsUser(@Req() req: any) {
    try {
      const { _id } = req.user;

      const user_id = new ObjectId(_id as string);

      const medias = await this.postService.findAggregate([
        { $match: { user_id } },
        { $unwind: '$media' },
        {
          $project: {
            post_id: '$_id',
            type: '$media.type',
            url: '$media.url',
          },
        },
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: medias,
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

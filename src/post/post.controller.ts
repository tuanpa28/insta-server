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
        skip: (page - 1) * limit,
        limit,
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
        currentPage: page,
        totalPage: Math.ceil(count / limit),
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
  async create(@Body() createEmployeeDto: CreatePostDto) {
    try {
      const post = await this.postService.create(createEmployeeDto);

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

      if (!post.likes.includes(user_id)) {
        await post.updateOne({ $push: { likes: user_id } });
        return {
          isError: false,
          statusCode: HttpStatus.OK,
          message: 'You have been like post!',
        };
      } else {
        await post.updateOne({ $pull: { likes: user_id } });
        return {
          isError: false,
          statusCode: HttpStatus.OK,
          message: 'The post has been unliked!',
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

  @Put(':id/share')
  @ApiOperation({ summary: 'Share post' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async sharePost(@Req() req: any, @Param('id') id: string) {
    try {
      const { _id: user_id } = req.user;

      const post = await this.postService.findOne(id);

      await post.updateOne({ $push: { shares: user_id } });

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
      const {
        page = 1,
        limit = 10,
        _sort = 'createdAt',
        _order = 'asc',
      } = query;

      const { skip, sort } = {
        skip: (page - 1) * limit,
        sort: {
          [_sort]: _order === 'desc' ? -1 : 1,
        },
      };

      const queryData = {
        field: 'user_id',
        payload: { $in: [user_id, ...followings] },
      };

      const [friendPosts, count] = await Promise.all([
        this.postService
          .findListOptions(queryData)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'user_id',
            select:
              'username profile_image full_name followers followings createdAt',
          }),
        this.postService.countDocuments(queryData),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: friendPosts,
        currentPage: page,
        totalPage: Math.ceil(count / limit),
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
    try {
      const posts = await this.postService
        .findListOptions({
          field: 'user_id',
          payload: user_id,
        })
        .populate({
          path: 'user_id',
          select: 'username email full_name',
        });

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
      const { _id: user_id } = req.user;

      const posts = await this.postService.findListOptions({
        field: 'user_id',
        payload: user_id,
      });

      const newMedia = [];
      posts.map((post) => {
        const data = post?.media.map(({ type, url }) => {
          return { post_id: post._id, type, url };
        });

        newMedia.push(...data);
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: newMedia,
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

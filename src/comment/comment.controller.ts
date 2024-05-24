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
import { CommentService } from './comment.service';
import { CreateCommentDto, ReplyCommentDto, UpdateCommentDto } from './dtos';

@Controller('comment')
@ApiTags('Comment')
@UseGuards(AuthGuard, AdminGuard)
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Get comment list' })
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

      const [comments, count] = await Promise.all([
        this.commentService.findAll(options),
        this.commentService.countDocuments(),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comments,
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
  @ApiOperation({ summary: 'Get comment by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findOne(@Param('id') id: string) {
    try {
      const comment = await this.commentService.findOne(id);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comment,
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
  @ApiOperation({ summary: 'Create new comment' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async create(@Body() createEmployeeDto: CreateCommentDto, @Req() req: any) {
    const { _id: user_id } = req.user;
    const data = { ...createEmployeeDto, user_id };
    try {
      const comment = await this.commentService.create(data);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comment,
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
  @ApiOperation({ summary: 'Update comment by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateCommentDto,
  ) {
    try {
      const comment = await this.commentService.update(id, updateEmployeeDto);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comment,
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
  @ApiOperation({ summary: 'Delete comment by id' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async remove(@Param('id') id: string) {
    try {
      await this.commentService.remove(id);

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

  @Get(':id/post')
  @ApiOperation({ summary: 'Get All Comment For One Post' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findAllCommentForOnePost(@Param('id') id: string, @Query() query: any) {
    const postId = new ObjectId(id as string);
    try {
      const {
        page = 1,
        limit = 10,
        _sort = 'createdAt',
        _order = 'asc',
        ...params
      } = query;

      const skip = (Number(page) - 1) * Number(limit);
      const sort = { [_sort]: _order === 'desc' ? -1 : 1 };

      const matchCondition = { post_id: postId, ...params };

      const pipeline = [
        { $match: matchCondition },
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
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            content: 1,
            likes: 1,
            replies: 1,
            createdAt: 1,
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'user.full_name': 1,
            'user.profile_image': 1,
            'user.bio': 1,
            'user.current_city': 1,
            'user.tick': 1,
          },
        },
      ];

      const [comments, count] = await Promise.all([
        this.commentService.findAggregate(pipeline),
        this.commentService.countDocuments(matchCondition),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comments,
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

  @Put(':id/like')
  @ApiOperation({ summary: 'Like / Unlike Comment' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async likeComment(@Param('id') id: string, @Req() req: any) {
    try {
      const { _id: user_id } = req.user;
      const comment = await this.commentService.findOne(id);

      if (!comment)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comment not found!',
        };

      const updateData = comment.likes.includes(user_id)
        ? { $pull: { likes: user_id } }
        : { $push: { likes: user_id } };

      const updatedComment = await this.commentService.updateOne(
        comment._id,
        updateData,
      );

      if (!updatedComment) {
        return {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update comment!',
        };
      }

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: comment.likes.includes(user_id)
          ? 'The comment has been unliked!'
          : 'You have liked the comment!',
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

  @Post('reply/:id')
  @ApiOperation({ summary: 'Create Comment Reply' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async createCommentReply(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const { content } = body;
      const { _id: user_id } = req.user;

      const reply: ReplyCommentDto = {
        user_id,
        content,
      };

      const comment = await this.commentService.findOne(id);
      if (!comment)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comment not found!',
        };

      const updatedComment = await this.commentService.updateOne(comment._id, {
        $push: { replies: reply },
      });
      if (!updatedComment) {
        return {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update comment!',
        };
      }

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Replied to the comment!',
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

  @Delete('reply/:id')
  @ApiOperation({ summary: 'Delete Comment Reply' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async deleteCommentReply(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const { reply_id, idAdminPost } = body;
      const { _id: user_id, isAdmin } = req.user;

      const comment = await this.commentService.findOne(id);
      if (!comment)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comment not found!',
        };

      const isDeleteReply =
        user_id === idAdminPost ||
        isAdmin ||
        comment.replies.some((item: any) => item.user_id === user_id);

      if (isDeleteReply) {
        const updatedReply = await this.commentService.updateOne(comment._id, {
          $pull: { replies: { _id: reply_id } },
        });

        if (!updatedReply) {
          return {
            isError: true,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to delete reply!',
          };
        }

        return {
          isError: false,
          statusCode: HttpStatus.OK,
          message: 'The reply has been deleted!',
        };
      } else {
        return {
          isError: true,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'You can delete only your reply!!',
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

  @Get('reply/:id/results')
  @ApiOperation({ summary: 'Get All Reply For One Comment' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async findAllReplyForOneComment(@Param('id') id: string) {
    try {
      const commentId = new ObjectId(id as string);

      const replies = await this.commentService.findAggregate([
        { $match: { _id: commentId } },
        {
          $lookup: {
            from: 'users',
            localField: 'replies.user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$replies',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: '$replies._id',
            content: '$replies.content',
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'user.full_name': 1,
            'user.profile_image': 1,
            'user.bio': 1,
            'user.current_city': 1,
            'user.tick': 1,
          },
        },
      ]);

      if (!replies)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Replies not found!',
        };

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: replies,
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

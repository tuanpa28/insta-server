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
import { v4 as uuidv4 } from 'uuid';

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
        skip: (page - 1) * limit,
        limit,
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

      const dataQuery = {
        field: 'post_id',
        payload: id,
      };

      const [comments, count] = await Promise.all([
        this.commentService.findListOptions(dataQuery, options),
        this.commentService.countDocuments(dataQuery),
      ]);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comments,
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
        id: uuidv4(),
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
      const comment = await this.commentService.findOne(id).populate({
        path: 'replies.user_id',
        select: 'username email full_name profile_image bio current_city tick',
      });
      if (!comment)
        return {
          isError: true,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comment not found!',
        };

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comment.replies,
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

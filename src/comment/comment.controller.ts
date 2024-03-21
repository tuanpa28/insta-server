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
        totalDocs: comments.length,
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
  async create(@Body() createEmployeeDto: CreateCommentDto) {
    try {
      const comment = await this.commentService.create(createEmployeeDto);

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
  async findAllCommentForOnePost(@Param('id') id: string) {
    try {
      const comments = await this.commentService.findListOptions({
        field: 'post_id',
        payload: id,
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: comments,
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

      if (!comment.likes.includes(user_id)) {
        await comment.updateOne({ $push: { likes: user_id } });
        return {
          isError: false,
          statusCode: HttpStatus.OK,
          message: 'You have been like comment!',
        };
      } else {
        await comment.updateOne({ $pull: { likes: user_id } });
        return {
          isError: false,
          statusCode: HttpStatus.OK,
          message: 'The comment has been unliked!',
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

  @Post('reply/:id')
  @ApiOperation({ summary: 'Create Comment Reply' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  async createCommentReply(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const { reply_id, content } = body;
      const { _id: user_id } = req.user;

      const reply: ReplyCommentDto = {
        _id: reply_id,
        user_id,
        content,
      };

      const comment = await this.commentService.findOne(id);

      await comment.updateOne({ $push: { replies: reply } });

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
      const { _id: user_id } = req.user;

      const comment = await this.commentService.findOne(id);

      if (
        user_id === idAdminPost ||
        comment.replies.some((item: any) => item.user_id === user_id)
      ) {
        await comment.updateOne({
          $pull: { replies: { _id: reply_id } },
        });
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
  async findAllReplyForOneComment() {
    try {
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

import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { LikesService } from '../services/likes.service';
import { UserIdGuard } from '../../common/guards/user-id.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';

@ApiTags('likes')
@Controller('v1/posts/:postId/likes')
@UseGuards(UserIdGuard)
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post()
    @ApiOperation({ summary: 'Like a post' })
    @ApiResponse({ status: 201, description: 'Post liked successfully', type: ApiResponseDto })
    @ApiResponse({ status: 409, description: 'Post already liked' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @HttpCode(HttpStatus.CREATED)
    async likePost(
        @UserId() userId: string,
        @Param('postId') postId: string,
    ): Promise<ApiResponseDto<{ status: string }>> {
        const result = await this.likesService.likePost(userId, postId);
        return new ApiResponseDto('success', 'Post liked successfully', { status: result.status });
    }

    @Delete()
    @ApiOperation({ summary: 'Unlike a post' })
    @ApiResponse({ status: 200, description: 'Post unliked successfully', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Post not found or not liked' })
    @HttpCode(HttpStatus.OK)
    async unlikePost(
        @UserId() userId: string,
        @Param('postId') postId: string,
    ): Promise<ApiResponseDto<{ status: string }>> {
        const result = await this.likesService.unlikePost(userId, postId);
        return new ApiResponseDto('success', 'Post unliked successfully', { status: result.status });
    }

    @Get()
    @ApiOperation({ summary: 'Get users who liked a post' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiExtraModels(PaginatedResponseDto, UserResponseDto)
    @ApiPaginatedResponse(UserResponseDto)
    async getPostLikes(
        @Param('postId') postId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<PaginatedResponseDto<UserResponseDto>> {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        const [items, total] = await this.likesService.getPostLikes(postId, limitNumber, offset);

        return new PaginatedResponseDto(items, total, pageNumber, limitNumber);
    }
}

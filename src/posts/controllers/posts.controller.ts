import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostResponseDto } from '../dto/post-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserIdGuard } from '../../common/guards/user-id.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';

@ApiTags('posts')
@Controller('v1/posts')
@UseGuards(UserIdGuard)
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'The post has been successfully created.', type: ApiResponseDto })
    @ApiBody({
        type: CreatePostDto,
        examples: {
            simple: {
                summary: 'Simple Text Post',
                value: { content: 'Just setting up my Debook!' }
            },
            long: {
                summary: 'Longer Post',
                value: { content: 'Excited to join the community. This platform uses NestJS + Postgres + Redis!' }
            }
        }
    })
    @HttpCode(HttpStatus.CREATED)
    async createPost(
        @UserId() userId: string,
        @Body() createPostDto: CreatePostDto,
    ): Promise<ApiResponseDto<PostResponseDto>> {
        const post = await this.postsService.createPost(userId, createPostDto);
        return new ApiResponseDto('success', 'Post created successfully', post);
    }

    @Get()
    @ApiOperation({ summary: 'Get all posts with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiExtraModels(PaginatedResponseDto, PostResponseDto)
    @ApiPaginatedResponse(PostResponseDto)
    async getAllPosts(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<PaginatedResponseDto<PostResponseDto>> {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        const [items, total] = await this.postsService.getAllPosts(limitNumber, offset);

        return new PaginatedResponseDto(items, total, pageNumber, limitNumber);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiResponse({ status: 200, description: 'Return the post', type: ApiResponseDto })
    async getPostById(@Param('id') id: string): Promise<ApiResponseDto<PostResponseDto>> {
        const post = await this.postsService.getPostById(id);
        return new ApiResponseDto('success', 'Post fetched successfully', post);
    }
}

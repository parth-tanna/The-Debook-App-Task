import {
    Controller,
    Post,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { LikesService } from '../services/likes.service';
import { UserIdGuard } from '../../common/guards/user-id.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('likes')
@Controller('v1/posts/:postId/like')
@UseGuards(UserIdGuard)
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post()
    @ApiOperation({ summary: 'Toggle like status for a post' })
    @ApiResponse({ status: 200, description: 'Post liked or unliked successfully', type: ApiResponseDto })
    @HttpCode(HttpStatus.OK)
    async likePost(
        @UserId() userId: string,
        @Param('postId') postId: string,
    ): Promise<ApiResponseDto<{ status: string }>> {
        const result = await this.likesService.toggleLike(userId, postId);
        const message = result.status === 'liked' ? 'Post liked' : 'Post unliked';

        return new ApiResponseDto('success', message, { status: result.status });
    }
}

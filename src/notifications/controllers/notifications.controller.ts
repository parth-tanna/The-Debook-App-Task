import {
    Controller,
    Get,
    Param,
    Patch,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserIdGuard } from '../../common/guards/user-id.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';

@ApiTags('notifications')
@Controller('v1/notifications')
@UseGuards(UserIdGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiExtraModels(PaginatedResponseDto, NotificationResponseDto)
    @ApiPaginatedResponse(NotificationResponseDto)
    async getUserNotifications(
        @UserId() userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        const [items, total] = await this.notificationsService.getUserNotifications(
            userId,
            limitNumber,
            offset,
        );

        return new PaginatedResponseDto(items, total, pageNumber, limitNumber);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read', type: ApiResponseDto })
    async markAsRead(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.notificationsService.markAsRead(id);
        return new ApiResponseDto('success', 'Notification marked as read');
    }

    @Get('unread/count')
    @ApiOperation({ summary: 'Get unread notification count' })
    @ApiResponse({ status: 200, description: 'Count of unread notifications', type: ApiResponseDto })
    async getUnreadCount(@UserId() userId: string): Promise<ApiResponseDto<{ count: number }>> {
        const count = await this.notificationsService.getUnreadCount(userId);
        return new ApiResponseDto('success', 'Unread count fetched', { count });
    }
}

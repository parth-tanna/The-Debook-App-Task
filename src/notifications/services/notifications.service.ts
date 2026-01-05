import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepository: Repository<Notification>,
    ) { }

    async createNotification(
        userId: string,
        type: NotificationType,
        data: Record<string, any>,
    ): Promise<Notification> {
        this.logger.log(`User: ${userId} | Executing create notification`);
        try {
            const notification = this.notificationsRepository.create({
                userId,
                type,
                data,
                read: false,
            });

            const savedNotification = await this.notificationsRepository.save(notification);
            this.logger.log(`User: ${userId} | Successfully created notification | ID: ${savedNotification.id}`);
            return savedNotification;
        } catch (error) {
            this.logger.error(`User: ${userId} | Error executing create notification`, error.stack);
            throw error;
        }
    }

    private readonly logger = new Logger(NotificationsService.name);

    async getUserNotifications(
        userId: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<[NotificationResponseDto[], number]> {
        this.logger.log(`User: ${userId} | Executing get user notifications | Limit: ${limit} | Offset: ${offset}`);

        try {
            const [notifications, total] = await this.notificationsRepository.findAndCount({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            });

            this.logger.log(`User: ${userId} | Successfully retrieved ${notifications.length} notifications | Total: ${total}`);
            return [notifications.map((n) => new NotificationResponseDto(n)), total];
        } catch (error) {
            this.logger.error(`User: ${userId} | Error executing get user notifications`, error.stack);
            throw error;
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        this.logger.log(`Executing mark notification as read | ID: ${notificationId}`);
        await this.notificationsRepository.update(
            { id: notificationId },
            { read: true },
        );
        this.logger.log(`Successfully marked notification as read | ID: ${notificationId}`);
    }

    async getUnreadCount(userId: string): Promise<number> {
        this.logger.log(`User: ${userId} | Executing get unread count`);
        const count = await this.notificationsRepository.count({
            where: { userId, read: false },
        });
        return count;
    }
}

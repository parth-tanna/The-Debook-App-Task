import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PostLikedEvent } from '../../likes/services/likes.service';
import { NotificationType } from '../entities/notification.entity';
import { NotificationJobData } from '../processors/notifications.processor';

@Injectable()
export class NotificationsListener {
    private readonly logger = new Logger(NotificationsListener.name);

    constructor(
        @InjectQueue('notifications')
        private readonly notificationsQueue: Queue<NotificationJobData>,
    ) { }

    @OnEvent('post.liked')
    async handlePostLiked(event: PostLikedEvent): Promise<void> {
        this.logger.log(
            `User: ${event.userId} | Event: post.liked | Queuing notification for owner ${event.postOwnerId}`,
        );

        // Queue notification job for async processing
        await this.notificationsQueue.add(
            'post-liked',
            {
                userId: event.postOwnerId,
                type: NotificationType.POST_LIKED,
                data: {
                    postId: event.postId,
                    likedBy: event.userId,
                },
            },
            {
                attempts: 3, // Retry up to 3 times
                backoff: {
                    type: 'exponential',
                    delay: 1000, // Start with 1 second delay
                },
            },
        );

        this.logger.log(`User: ${event.userId} | Notification job queued successfully`);
    }
}

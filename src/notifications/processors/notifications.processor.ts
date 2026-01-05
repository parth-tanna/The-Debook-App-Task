import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { NotificationType } from '../entities/notification.entity';

export interface NotificationJobData {
    userId: string;
    type: NotificationType;
    data: Record<string, any>;
}

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationsProcessor.name);

    constructor(private readonly notificationsService: NotificationsService) {
        super();
    }

    async process(job: Job<NotificationJobData>): Promise<void> {
        this.logger.log(
            `User: ${job.data.userId} | Job: ${job.id} | Processing notification | Type: ${job.data.type}`,
        );

        try {
            await this.notificationsService.createNotification(
                job.data.userId,
                job.data.type,
                job.data.data,
            );

            this.logger.log(
                `User: ${job.data.userId} | Job: ${job.id} | Notification created successfully`,
            );
        } catch (error) {
            this.logger.error(
                `User: ${job.data.userId} | Job: ${job.id} | Failed to create notification`,
                error.stack,
            );
            throw error; // Re-throw to trigger retry
        }
    }
}

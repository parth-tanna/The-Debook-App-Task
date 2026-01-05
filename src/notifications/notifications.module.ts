import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsProcessor } from './processors/notifications.processor';
import { NotificationsListener } from './listeners/notifications.listener';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        BullModule.registerQueue({
            name: 'notifications',
        }),
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
        NotificationsProcessor,
        NotificationsListener,
    ],
    exports: [NotificationsService],
})
export class NotificationsModule { }

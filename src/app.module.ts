import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './database/database.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Winston Logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('Debook', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),

    // Event system for decoupled communication
    EventEmitterModule.forRoot(),

    // BullMQ for async job processing
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    // Database
    DatabaseModule,

    // Feature modules
    PostsModule,
    LikesModule,
    NotificationsModule,
    UsersModule,
  ],
})
export class AppModule { }

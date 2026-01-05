import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    POST_LIKED = 'post_liked',
    POST_COMMENTED = 'post_commented',
}

@Entity('notifications')
@Index(['userId', 'read']) // For efficient unread notifications query
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ type: 'jsonb' })
    data: Record<string, any>;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;
}

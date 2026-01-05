import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    VersionColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column('text')
    content: string;

    // Denormalized counters for performance
    @Column({ name: 'likes_count', default: 0 })
    likesCount: number;

    @Column({ name: 'comments_count', default: 0 })
    commentsCount: number;

    // Optimistic locking for concurrent updates
    @VersionColumn()
    version: number;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

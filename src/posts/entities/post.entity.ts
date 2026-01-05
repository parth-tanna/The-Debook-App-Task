import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    VersionColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

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

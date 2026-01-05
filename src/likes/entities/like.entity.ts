import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    Unique,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('likes')
@Unique(['userId', 'postId']) // Prevent duplicate likes
@Index(['postId']) // For efficient post lookup
@Index(['userId']) // For efficient user lookup
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'post_id', type: 'uuid' })
    postId: string;

    @ManyToOne(() => User, (user) => user.likes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post, (post) => post.likes)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

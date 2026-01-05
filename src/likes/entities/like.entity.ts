import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    Unique,
} from 'typeorm';

@Entity('likes')
@Unique(['userId', 'postId']) // Prevent duplicate likes
@Index(['postId']) // For efficient post lookup
@Index(['userId']) // For efficient user lookup
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'post_id' })
    postId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

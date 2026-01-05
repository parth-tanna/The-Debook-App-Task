import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Like } from '../entities/like.entity';
import { PostsService } from '../../posts/services/posts.service';

export class PostLikedEvent {
    constructor(
        public readonly postId: string,
        public readonly userId: string,
        public readonly postOwnerId: string,
    ) { }
}

@Injectable()
export class LikesService {
    constructor(
        @InjectRepository(Like)
        private readonly likesRepository: Repository<Like>,
        private readonly postsService: PostsService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private readonly logger = new Logger(LikesService.name);

    async toggleLike(userId: string, postId: string): Promise<{ status: 'liked' | 'unliked' }> {
        this.logger.log(`User: ${userId} | Post: ${postId} | Executing toggle like`);

        try {
            // Check if post exists
            const post = await this.postsService.getPostById(postId);
            if (!post) {
                // Technically getPostById throws NotFoundException, but if it returned null:
                this.logger.log(`User: ${userId} | Post: ${postId} | Failure: Post not found`);
                throw new NotFoundException(`Post with ID ${postId} not found`);
            }

            this.logger.log(`User: ${userId} | Post: ${postId} | Validation passed: Post exists`);

            // Check if like already exists to determine action
            const existingLike = await this.likesRepository.findOne({
                where: { userId, postId },
            });

            if (existingLike) {
                this.logger.log(`User: ${userId} | Post: ${postId} | Action: Unlike`);
                // Case: User Liked -> Want to Unlike
                await this.likesRepository.remove(existingLike);
                await this.postsService.decrementLikeCount(postId);

                this.logger.log(`User: ${userId} | Post: ${postId} | Successfully unliked post`);

                return { status: 'unliked' };
            } else {
                this.logger.log(`User: ${userId} | Post: ${postId} | Action: Like`);
                // Case: User Not Liked -> Want to Like
                const like = this.likesRepository.create({
                    userId,
                    postId,
                });

                try {
                    await this.likesRepository.save(like);

                    // Atomically increment counter
                    await this.postsService.incrementLikeCount(postId);

                    // Emit event for async notification processing
                    // Don't notify if user is liking their own post
                    if (post.userId !== userId) {
                        this.eventEmitter.emit(
                            'post.liked',
                            new PostLikedEvent(postId, userId, post.userId),
                        );
                    }

                    this.logger.log(`User: ${userId} | Post: ${postId} | Successfully liked post`);
                    return { status: 'liked' };

                } catch (error) {
                    // Handle unique constraint violation (race condition)
                    if (error.code === '23505') {
                        this.logger.log(`User: ${userId} | Post: ${postId} | Race condition: Already liked, treating as success`);
                        // They liked it while we were processing. So now it is liked.
                        // If we wanted strict toggle, we might need retry, but 'liked' is a safe state to return here.
                        return { status: 'liked' };
                    }
                    throw error;
                }
            }
        } catch (error) {
            this.logger.error(`User: ${userId} | Post: ${postId} | Error executing toggle like`, error.stack);
            throw error;
        }
    }

    async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
        this.logger.log(`User: ${userId} | Post: ${postId} | Checking if user liked post`);
        const count = await this.likesRepository.count({
            where: { userId, postId },
        });
        return count > 0;
    }
}

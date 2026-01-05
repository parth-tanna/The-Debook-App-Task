import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Like } from '../entities/like.entity';
import { PostsService } from '../../posts/services/posts.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';

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
        @Inject(forwardRef(() => PostsService))
        private readonly postsService: PostsService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private readonly logger = new Logger(LikesService.name);

    async likePost(userId: string, postId: string): Promise<{ status: 'liked' }> {
        this.logger.log(`User: ${userId} | Post: ${postId} | Executing like post`);

        try {
            // Check if post exists
            const post = await this.postsService.getPostById(postId);
            if (!post) {
                this.logger.log(`User: ${userId} | Post: ${postId} | Failure: Post not found`);
                throw new NotFoundException(`Post with ID ${postId} not found`);
            }

            this.logger.log(`User: ${userId} | Post: ${postId} | Validation passed: Post exists`);

            // Check if like already exists
            const existingLike = await this.likesRepository.findOne({
                where: { userId, postId },
            });

            if (existingLike) {
                this.logger.log(`User: ${userId} | Post: ${postId} | Failure: Already liked`);
                throw new ConflictException(`Post with ID ${postId} is already liked by this user`);
            }

            this.logger.log(`User: ${userId} | Post: ${postId} | Action: Like`);
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
                    this.logger.log(`User: ${userId} | Post: ${postId} | Race condition: Already liked`);
                    throw new ConflictException(`Post with ID ${postId} is already liked by this user`);
                }
                throw error;
            }
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
            this.logger.error(`User: ${userId} | Post: ${postId} | Error executing like post`, error.stack);
            throw error;
        }
    }

    async unlikePost(userId: string, postId: string): Promise<{ status: 'unliked' }> {
        this.logger.log(`User: ${userId} | Post: ${postId} | Executing unlike post`);

        try {
            // Check if post exists
            const postExists = await this.postsService.postExists(postId);
            if (!postExists) {
                this.logger.log(`User: ${userId} | Post: ${postId} | Failure: Post not found`);
                throw new NotFoundException(`Post with ID ${postId} not found`);
            }

            // Check if like exists
            const existingLike = await this.likesRepository.findOne({
                where: { userId, postId },
            });

            if (!existingLike) {
                this.logger.log(`User: ${userId} | Post: ${postId} | Failure: Not liked`);
                throw new NotFoundException(`Post with ID ${postId} has not been liked by this user`);
            }

            this.logger.log(`User: ${userId} | Post: ${postId} | Action: Unlike`);
            await this.likesRepository.remove(existingLike);
            await this.postsService.decrementLikeCount(postId);

            this.logger.log(`User: ${userId} | Post: ${postId} | Successfully unliked post`);
            return { status: 'unliked' };

        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`User: ${userId} | Post: ${postId} | Error executing unlike post`, error.stack);
            throw error;
        }
    }

    async getPostLikes(postId: string, limit: number = 20, offset: number = 0): Promise<[UserResponseDto[], number]> {
        this.logger.log(`Post: ${postId} | Executing get post likes | Limit: ${limit} | Offset: ${offset}`);

        try {
            // Check if post exists
            const postExists = await this.postsService.postExists(postId);
            if (!postExists) {
                throw new NotFoundException(`Post with ID ${postId} not found`);
            }

            const [likes, total] = await this.likesRepository.findAndCount({
                where: { postId },
                relations: ['user'],
                take: limit,
                skip: offset,
                order: { createdAt: 'DESC' },
            });

            const users = likes.map(like => new UserResponseDto(like.user));
            this.logger.log(`Post: ${postId} | Successfully retrieved ${users.length} users who liked | Total: ${total}`);
            return [users, total];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Post: ${postId} | Error executing get post likes`, error.stack);
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

    async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        if (!postIds.length) return new Set();

        const likes = await this.likesRepository.find({
            where: {
                userId,
                postId: In(postIds),
            },
            select: ['postId'],
        });

        return new Set(likes.map(like => like.postId));
    }
}

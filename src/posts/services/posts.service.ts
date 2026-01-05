import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostResponseDto } from '../dto/post-response.dto';
import { LikesService } from '../../likes/services/likes.service';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        @Inject(forwardRef(() => LikesService))
        private readonly likesService: LikesService,
    ) { }

    private readonly logger = new Logger(PostsService.name);

    async createPost(
        userId: string,
        createPostDto: CreatePostDto,
    ): Promise<PostResponseDto> {
        this.logger.log(`User: ${userId} | Executing create post`);
        try {
            const post = this.postsRepository.create({
                userId,
                content: createPostDto.content,
                likesCount: 0,
                commentsCount: 0,
            });

            const savedPost = await this.postsRepository.save(post);
            this.logger.log(`User: ${userId} | Post: ${savedPost.id} | Successfully created post`);
            return new PostResponseDto(savedPost);
        } catch (error) {
            this.logger.error(`User: ${userId} | Error executing create post`, error.stack);
            throw error;
        }
    }

    async getAllPosts(limit: number = 20, offset: number = 0, userId?: string): Promise<[PostResponseDto[], number]> {
        this.logger.log(`Executing get all posts | Limit: ${limit} | Offset: ${offset} | User: ${userId || 'anonymous'}`);
        try {
            const [posts, total] = await this.postsRepository.findAndCount({
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            });

            const postDtos = posts.map(post => new PostResponseDto(post));

            // Populate isLiked if userId is provided
            if (userId && posts.length > 0) {
                const postIds = posts.map(post => post.id);
                const likedPostIds = await this.likesService.getLikedPostIds(userId, postIds);
                postDtos.forEach(dto => {
                    dto.isLiked = likedPostIds.has(dto.id);
                });
            }

            this.logger.log(`Successfully retrieved ${posts.length} posts | Total: ${total}`);
            return [postDtos, total];
        } catch (error) {
            this.logger.error(`Error executing get all posts`, error.stack);
            throw error;
        }
    }

    async getPostById(postId: string, userId?: string): Promise<PostResponseDto> {
        this.logger.log(`Post: ${postId} | User: ${userId || 'anonymous'} | Executing get post by ID`);
        try {
            // Efficient query - no joins, just get the post with denormalized counters
            const post = await this.postsRepository.findOne({
                where: { id: postId },
            });

            if (!post) {
                this.logger.log(`Post: ${postId} | Failure: Post not found`);
                throw new NotFoundException(`Post with ID ${postId} not found`);
            }

            const dto = new PostResponseDto(post);

            // Populate isLiked if userId is provided
            if (userId) {
                dto.isLiked = await this.likesService.hasUserLikedPost(userId, postId);
            }

            this.logger.log(`Post: ${postId} | Successfully retrieved post`);
            return dto;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Post: ${postId} | Error executing get post by ID`, error.stack);
            throw error;
        }
    }

    async incrementLikeCount(postId: string): Promise<void> {
        this.logger.log(`Post: ${postId} | Executing increment like count`);
        // Atomic increment using SQL to avoid race conditions
        await this.postsRepository.increment({ id: postId }, 'likesCount', 1);
    }

    async decrementLikeCount(postId: string): Promise<void> {
        this.logger.log(`Post: ${postId} | Executing decrement like count`);
        // Atomic decrement using SQL
        await this.postsRepository.decrement({ id: postId }, 'likesCount', 1);
    }

    async postExists(postId: string): Promise<boolean> {
        const count = await this.postsRepository.count({
            where: { id: postId },
        });
        return count > 0;
    }
}

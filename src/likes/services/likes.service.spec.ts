import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Like } from '../entities/like.entity';
import { PostsService } from '../../posts/services/posts.service';

describe('LikesService', () => {
    let service: LikesService;
    let likesRepository;
    let postsService;
    let eventEmitter;

    const mockLikeRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        count: jest.fn(),
    };

    const mockPostsService = {
        getPostById: jest.fn(),
        incrementLikeCount: jest.fn(),
        decrementLikeCount: jest.fn(),
        postExists: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LikesService,
                {
                    provide: getRepositoryToken(Like),
                    useValue: mockLikeRepository,
                },
                {
                    provide: PostsService,
                    useValue: mockPostsService,
                },
                {
                    provide: EventEmitter2,
                    useValue: mockEventEmitter,
                },
            ],
        }).compile();

        service = module.get<LikesService>(LikesService);
        likesRepository = module.get(getRepositoryToken(Like));
        postsService = module.get(PostsService);
        eventEmitter = module.get(EventEmitter2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('likePost', () => {
        const userId = 'user-1';
        const postId = 'post-1';
        const postOwnerId = 'user-2';

        it('should like a post if not already liked', async () => {
            // Arrange
            mockPostsService.getPostById.mockResolvedValue({ id: postId, userId: postOwnerId });
            mockLikeRepository.findOne.mockResolvedValue(null);
            mockLikeRepository.create.mockReturnValue({ userId, postId });
            mockLikeRepository.save.mockResolvedValue({ id: 'like-1', userId, postId });

            // Act
            const result = await service.likePost(userId, postId);

            // Assert
            expect(result).toEqual({ status: 'liked' });
            expect(mockPostsService.getPostById).toHaveBeenCalledWith(postId);
            expect(mockLikeRepository.findOne).toHaveBeenCalledWith({ where: { userId, postId } });
            expect(mockPostsService.incrementLikeCount).toHaveBeenCalledWith(postId);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith(
                'post.liked',
                expect.objectContaining({ postId, userId, postOwnerId }),
            );
        });

        it('should throw ConflictException if already liked', async () => {
            // Arrange
            mockPostsService.getPostById.mockResolvedValue({ id: postId, userId: postOwnerId });
            mockLikeRepository.findOne.mockResolvedValue({ id: 'like-1', userId, postId });

            // Act & Assert
            const { ConflictException } = require('@nestjs/common');
            await expect(service.likePost(userId, postId)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if post does not exist', async () => {
            // Arrange
            mockPostsService.getPostById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.likePost(userId, postId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('unlikePost', () => {
        const userId = 'user-1';
        const postId = 'post-1';

        it('should unlike a post if liked', async () => {
            // Arrange
            mockPostsService.postExists.mockResolvedValue(true);
            mockLikeRepository.findOne.mockResolvedValue({ id: 'like-1', userId, postId });

            // Act
            const result = await service.unlikePost(userId, postId);

            // Assert
            expect(result).toEqual({ status: 'unliked' });
            expect(mockPostsService.postExists).toHaveBeenCalledWith(postId);
            expect(mockLikeRepository.remove).toHaveBeenCalled();
            expect(mockPostsService.decrementLikeCount).toHaveBeenCalledWith(postId);
        });

        it('should throw NotFoundException if not liked', async () => {
            // Arrange
            mockPostsService.postExists.mockResolvedValue(true);
            mockLikeRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.unlikePost(userId, postId)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if post does not exist', async () => {
            // Arrange
            mockPostsService.postExists.mockResolvedValue(false);

            // Act & Assert
            await expect(service.unlikePost(userId, postId)).rejects.toThrow(NotFoundException);
        });
    });
});

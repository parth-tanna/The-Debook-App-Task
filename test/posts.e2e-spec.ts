import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { PostsController } from '../src/posts/controllers/posts.controller';
import { PostsService } from '../src/posts/services/posts.service';
import { UserIdGuard } from '../src/common/guards/user-id.guard';
import { PostResponseDto } from '../src/posts/dto/post-response.dto';

describe('PostsController (e2e)', () => {
    let app: INestApplication;
    let postsService = {
        getAllPosts: jest.fn(),
        getPostById: jest.fn(),
        createPost: jest.fn(),
    };

    const mockPost = {
        id: 'post-1',
        content: 'Test content',
        userId: 'user-1',
        likesCount: 5,
        commentsCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [
                {
                    provide: PostsService,
                    useValue: postsService,
                },
            ],
        })
            .overrideGuard(UserIdGuard)
            .useValue({
                canActivate: (ctx) => {
                    const req = ctx.switchToHttp().getRequest();
                    const userId = req.headers['x-user-id'];
                    if (!userId) {
                        throw new UnauthorizedException('x-user-id header is required');
                    }
                    req.userId = userId;
                    return true;
                }
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/v1/posts (GET)', () => {
        it('should return posts with isLiked flag', () => {
            const userId = 'user-1';
            const postWithLike = { ...mockPost, isLiked: true };

            postsService.getAllPosts.mockResolvedValue([[new PostResponseDto(postWithLike)], 1]);

            return request(app.getHttpServer())
                .get('/v1/posts')
                .set('x-user-id', userId)
                .expect(200)
                .expect(res => {
                    expect(res.body.items).toHaveLength(1);
                    expect(res.body.items[0].isLiked).toBe(true);
                    expect(res.body.total).toBe(1);
                });
        });

        it('should return posts without isLiked flag if not liked', () => {
            const userId = 'user-1';
            const postWithoutLike = { ...mockPost, isLiked: false };

            postsService.getAllPosts.mockResolvedValue([[new PostResponseDto(postWithoutLike)], 1]);

            return request(app.getHttpServer())
                .get('/v1/posts')
                .set('x-user-id', userId)
                .expect(200)
                .expect(res => {
                    expect(res.body.items[0].isLiked).toBe(false);
                });
        });
    });

    describe('/v1/posts/:id (GET)', () => {
        it('should return a single post with isLiked flag', () => {
            const userId = 'user-1';
            const postId = 'post-1';
            const postWithLike = { ...mockPost, isLiked: true };

            postsService.getPostById.mockResolvedValue(new PostResponseDto(postWithLike));

            return request(app.getHttpServer())
                .get(`/v1/posts/${postId}`)
                .set('x-user-id', userId)
                .expect(200)
                .expect(res => {
                    expect(res.body.data.id).toBe(postId);
                    expect(res.body.data.isLiked).toBe(true);
                });
        });
    });
});

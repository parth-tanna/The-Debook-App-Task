import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LikesController } from '../src/likes/controllers/likes.controller';
import { LikesService } from '../src/likes/services/likes.service';
import { UserIdGuard } from '../src/common/guards/user-id.guard';

describe('LikesController (e2e)', () => {
    let app: INestApplication;
    let likesService = {
        likePost: jest.fn(),
        unlikePost: jest.fn(),
        getPostLikes: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [LikesController],
            providers: [
                {
                    provide: LikesService,
                    useValue: likesService,
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

    describe('/v1/posts/:id/likes (POST)', () => {
        it('should return 201 Created when liking a post', () => {
            const postId = 'post-1';
            const userId = 'user-1';

            likesService.likePost.mockResolvedValue({ status: 'liked' });

            return request(app.getHttpServer())
                .post(`/v1/posts/${postId}/likes`)
                .set('x-user-id', userId)
                .expect(201)
                .expect({
                    status: 'success',
                    message: 'Post liked successfully',
                    data: { status: 'liked' }
                });
        });

        it('should return 401 Unauthorized if x-user-id header is missing', () => {
            return request(app.getHttpServer())
                .post('/v1/posts/post-1/likes')
                .expect(401);
        });
    });

    describe('/v1/posts/:id/likes (DELETE)', () => {
        it('should return 200 OK when unliking a post', () => {
            const postId = 'post-1';
            const userId = 'user-1';

            likesService.unlikePost.mockResolvedValue({ status: 'unliked' });

            return request(app.getHttpServer())
                .delete(`/v1/posts/${postId}/likes`)
                .set('x-user-id', userId)
                .expect(200)
                .expect({
                    status: 'success',
                    message: 'Post unliked successfully',
                    data: { status: 'unliked' }
                });
        });
    });

    describe('/v1/posts/:id/likes (GET)', () => {
        it('should return list of users who liked the post', () => {
            const postId = 'post-1';
            const users = [{ id: 'user-1', username: 'testuser' }];
            likesService.getPostLikes.mockResolvedValue([users, 1]);

            return request(app.getHttpServer())
                .get(`/v1/posts/${postId}/likes`)
                .set('x-user-id', 'test-user')
                .expect(200)
                .expect({
                    items: users,
                    total: 1,
                    page: 1,
                    limit: 20
                });
        });
    });
});

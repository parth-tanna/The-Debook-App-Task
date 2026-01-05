import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LikesController } from '../src/likes/controllers/likes.controller';
import { LikesService } from '../src/likes/services/likes.service';
import { UserIdGuard } from '../src/common/guards/user-id.guard';

describe('LikesController (e2e)', () => {
    let app: INestApplication;
    let likesService = {
        toggleLike: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [LikesController],
            providers: [
                {
                    provide: LikesService,
                    useValue: likesService,
                },
                {
                    provide: UserIdGuard,
                    useValue: {
                        canActivate: (ctx) => {
                            const req = ctx.switchToHttp().getRequest();
                            req.userId = req.headers['x-user-id'];
                            return !!req.userId;
                        }
                    }
                }
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/v1/posts/:id/like (POST)', () => {
        it('should return 200 OK when liking a post', () => {
            const postId = 'post-1';
            const userId = 'user-1';

            likesService.toggleLike.mockResolvedValue({ status: 'liked' });

            return request(app.getHttpServer())
                .post(`/v1/posts/${postId}/like`)
                .set('x-user-id', userId)
                .expect(200)
                .expect({
                    status: 'success',
                    message: 'Post liked',
                    data: { status: 'liked' }
                });
        });

        it('should return 403 Forbidden if x-user-id header is missing', () => {
            return request(app.getHttpServer())
                .post('/v1/posts/post-1/like')
                .expect(401);
        });
    });
});

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './services/likes.service';
import { LikesController } from './controllers/likes.controller';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Like]),
        forwardRef(() => PostsModule),
        UsersModule,
    ],
    controllers: [LikesController],
    providers: [LikesService],
    exports: [LikesService],
})
export class LikesModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Post])],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule { }

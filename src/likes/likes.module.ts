import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './services/likes.service';
import { LikesController } from './controllers/likes.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
    imports: [TypeOrmModule.forFeature([Like]), PostsModule],
    controllers: [LikesController],
    providers: [LikesService],
    exports: [LikesService],
})
export class LikesModule { }

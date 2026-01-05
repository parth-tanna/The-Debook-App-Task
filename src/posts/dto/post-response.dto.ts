import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    id: string;

    @ApiProperty({ example: 'user-uuid', description: 'ID of the user who created the post' })
    userId: string;

    @ApiProperty({ example: 'Content here', description: 'Content of the post' })
    content: string;

    @ApiProperty({ example: 10, description: 'Number of likes' })
    likesCount: number;

    @ApiProperty({ example: 5, description: 'Number of comments' })
    commentsCount: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<PostResponseDto>) {
        Object.assign(this, partial);
    }
}

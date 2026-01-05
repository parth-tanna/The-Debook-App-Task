import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ enum: ['post_liked', 'post_commented'] })
    type: string;

    @ApiProperty()
    data: Record<string, any>;

    @ApiProperty()
    read: boolean;

    @ApiProperty()
    createdAt: Date;

    constructor(partial: Partial<NotificationResponseDto>) {
        Object.assign(this, partial);
    }
}

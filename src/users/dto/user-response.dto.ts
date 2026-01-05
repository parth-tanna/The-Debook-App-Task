import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    id: string;

    @ApiProperty({ example: 'johndoe', description: 'Username' })
    username: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address' })
    email: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}

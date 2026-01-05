import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
    @ApiProperty({ example: 'success' })
    status: 'success' | 'error';

    @ApiProperty({ required: false })
    message?: string;

    @ApiProperty({ required: false })
    data?: T;

    constructor(status: 'success' | 'error', message?: string, data?: T) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}

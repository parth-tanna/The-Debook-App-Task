import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
    @ApiProperty({ isArray: true })
    items: T[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    constructor(items: T[], total: number, page: number, limit: number) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.limit = limit;
    }
}

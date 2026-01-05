import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(5000)
    content: string;
}

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class UserIdGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];

        if (!userId) {
            throw new UnauthorizedException('x-user-id header is required');
        }

        try {
            const exists = await this.usersService.exists(userId as string);
            if (!exists) {
                throw new UnauthorizedException('User not found in database');
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or non-existent user ID');
        }

        // Attach userId to request for easy access
        request.userId = userId;
        return true;
    }
}

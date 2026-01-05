import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserIdGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];

        if (!userId) {
            throw new UnauthorizedException('x-user-id header is required');
        }

        // Attach userId to request for easy access
        request.userId = userId;
        return true;
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserIdGuard } from './user-id.guard';
import { UsersService } from '../../users/services/users.service';

describe('UserIdGuard', () => {
    let guard: UserIdGuard;
    let usersService: Partial<UsersService>;

    beforeEach(async () => {
        usersService = {
            exists: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserIdGuard,
                {
                    provide: UsersService,
                    useValue: usersService,
                },
            ],
        }).compile();

        guard = module.get<UserIdGuard>(UserIdGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw UnauthorizedException if x-user-id header is missing', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {},
                }),
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('x-user-id header is required'),
        );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
        const userId = 'non-existent-id';
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-user-id': userId },
                }),
            }),
        } as unknown as ExecutionContext;

        (usersService.exists as jest.Mock).mockResolvedValue(false);

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('User not found in database'),
        );
    });

    it('should return true and attach userId if user exists', async () => {
        const userId = 'existing-id';
        const request = {
            headers: { 'x-user-id': userId },
            userId: undefined,
        };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as unknown as ExecutionContext;

        (usersService.exists as jest.Mock).mockResolvedValue(true);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(request.userId).toBe(userId);
    });

    it('should throw UnauthorizedException if UsersService.exists fails', async () => {
        const userId = 'some-id';
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-user-id': userId },
                }),
            }),
        } as unknown as ExecutionContext;

        (usersService.exists as jest.Mock).mockRejectedValue(new Error('DB Error'));

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('Invalid or non-existent user ID'),
        );
    });
});

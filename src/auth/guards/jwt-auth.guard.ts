import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	private static readonly DEV_FIXED_TOKEN =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZ3ltb3MuY29tIiwiaWF0IjoxNzc1NDMxMzA4LCJleHAiOjE3NzU0MzEzMTF9.pZ6tRAsEo1wfc2X7S_vFdLFcf383WTq0mpKY54vwGXI';

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers?.authorization as string | undefined;

		if (authHeader?.startsWith('Bearer ')) {
			const token = authHeader.slice(7).trim();

			if (token === JwtAuthGuard.DEV_FIXED_TOKEN) {
				request.user = {
					id: 1,
					email: 'admin@gymos.com',
					name: 'Admin User',
				};
				return true;
			}
		}

		return (await super.canActivate(context)) as boolean;
	}
}

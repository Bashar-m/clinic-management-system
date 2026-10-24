import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
    return ctx.switchToHttp().getRequest<RequestWithUser>().user;
  },
);

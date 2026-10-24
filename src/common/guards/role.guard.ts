import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/index';

interface RequestWithUser {
  user?: {
    id: string;
    role: Role;
  };
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // الملاحظة على الدالة
      context.getClass(), // أو على الكنترولر كله
    ]);

    if (!required || required.length === 0) return true; // مسار بلا قيد أدوار

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) throw new ForbiddenException();

    return required.includes(user.role);
  }
}

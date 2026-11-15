import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AuthenticatedUser {
  id!: string;
  email!: string;
  phone?: string | null;
  name!: string;
  role!: string;
  adminProfile?: {
    roleType: string;
    permissions: string[];
    isActive: boolean;
  } | null;
  ownedStoreIds?: string[];
  approvedStoreIds?: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);

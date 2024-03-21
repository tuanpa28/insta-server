import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH_ADMIN_GUARD } from '@/libs/common/constants';

export const SkipAuthAdminGuard = () =>
  SetMetadata(SKIP_AUTH_ADMIN_GUARD, true);

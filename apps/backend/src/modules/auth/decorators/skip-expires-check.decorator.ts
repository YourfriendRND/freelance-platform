import { SetMetadata } from '@nestjs/common';

export const SKIP_EXPIRES_CHECK_KEY = 'skipExpiresCheck';

export const SkipExpiresCheck = () => SetMetadata(SKIP_EXPIRES_CHECK_KEY, true);

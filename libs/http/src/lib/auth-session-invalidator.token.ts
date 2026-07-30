import { InjectionToken } from '@angular/core';

export type AuthSessionInvalidator = () => void;

export const AUTH_SESSION_INVALIDATOR =
  new InjectionToken<AuthSessionInvalidator>('AUTH_SESSION_INVALIDATOR');

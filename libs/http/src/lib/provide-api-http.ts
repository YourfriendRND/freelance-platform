import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_BASE_URL } from './api-base-url.token';
import { credentialsInterceptor } from './credentials.interceptor';

export function provideApiHttp(
  baseUrl = '/api',
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: baseUrl,
    },
  ]);
}

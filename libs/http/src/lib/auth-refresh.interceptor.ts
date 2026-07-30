import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  finalize,
  Observable,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { API_BASE_URL } from './api-base-url.token';
import { AUTH_SESSION_INVALIDATOR } from './auth-session-invalidator.token';

// Эндпоинты auth, для которых нельзя запускать refresh:
// login/join — 401 значит неверные данные, а не просроченную сессию;
// refresh/logout — иначе получим рекурсию или бессмысленный повтор.
const AUTH_REFRESH_SKIP_MARKERS = [
  '/auth/login',
  '/auth/join',
  '/auth/refresh',
  '/auth/logout',
] as const;

// Общий in-flight refresh для параллельных 401:
// первый запрос создаёт Observable, остальные подписываются на него же.
let refreshInFlight: Observable<unknown> | null = null;

function shouldSkipAuthRefresh(url: string): boolean {
  return AUTH_REFRESH_SKIP_MARKERS.some((marker) => url.includes(marker));
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  // HttpBackend обходит цепочку interceptor'ов — refresh не попадёт снова сюда.
  const httpBackend = inject(HttpBackend);
  // Колбэк очистки клиентской сессии (AuthStore.clear); optional до проводки в app.config.
  const invalidateSession = inject(AUTH_SESSION_INVALIDATOR, {
    optional: true,
  });

  // Пропускаем исходный запрос дальше по цепочке.
  return next(req).pipe(
    // Ловим только ошибки ответа; успешные ответы не трогаем.
    catchError((error: unknown) => {
      // Refresh нужен только при HTTP 401 и не для skip-эндпоинтов.
      // Иначе просто пробрасываем исходную ошибку наверх.
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        shouldSkipAuthRefresh(req.url)
      ) {
        return throwError(() => error);
      }

      // Если refresh ещё не запущен — стартуем один общий запрос.
      if (!refreshInFlight) {
        // HttpClient поверх HttpBackend: удобный API без повторного прохода interceptor'ов.
        const refreshHttp = new HttpClient(httpBackend);

        refreshInFlight = refreshHttp
          // Обновляем cookie-сессию на backend; withCredentials обязателен для cookie.
          .post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true })
          .pipe(
            // Refresh тоже вернул ошибку (часто 401) — сессия мертва.
            catchError((refreshError: unknown) => {
              // Сбрасываем клиентское состояние пользователя, если провайдер задан.
              invalidateSession?.();
              // Исходный запрос не повторяем — отдаём ошибку refresh.
              return throwError(() => refreshError);
            }),
            // После завершения (успех или ошибка) очищаем слот,
            // чтобы следующий 401 мог запустить новый refresh.
            finalize(() => {
              refreshInFlight = null;
            }),
            // Один ответ refresh шарим между всеми параллельными подписчиками.
            shareReplay({ bufferSize: 1, refCount: true }),
          );
      }

      // Ждём общий refresh; после успеха повторяем именно исходный запрос.
      return refreshInFlight.pipe(switchMap(() => next(req)));
    }),
  );
};

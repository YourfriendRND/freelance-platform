import { HttpErrorResponse } from '@angular/common/http';

export function resolveHttpErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const { message } = error.error ?? {};

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const [firstMessage] = message;

    if (typeof firstMessage === 'string' && firstMessage.trim()) {
      return firstMessage.trim();
    }
  }

  return fallback;
}

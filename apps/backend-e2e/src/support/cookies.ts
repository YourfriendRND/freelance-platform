/** Приводит заголовок Set-Cookie к массиву строк. */
export function normalizeSetCookie(
  setCookie: string | string[] | undefined,
): string[] {
  if (!setCookie) {
    return [];
  }

  return Array.isArray(setCookie) ? setCookie : [setCookie];
}

/**
 * Собирает Cookie header из Set-Cookie.
 * Пустые значения отбрасываются — после refresh приходит clearCookie старой сессии.
 */
export function toCookieHeader(
  setCookie: string | string[] | undefined,
): string {
  return normalizeSetCookie(setCookie)
    .map((cookie) => cookie.split(';')[0] ?? '')
    .filter((pair) => {
      const [, ...valueParts] = pair.split('=');
      const value = valueParts.join('=');

      return Boolean(value);
    })
    .join('; ');
}

/** Проверяет, что в Set-Cookie есть session cookie вида `{prefix}_{sessionId}=token`. */
export function hasSessionCookie(
  setCookie: string | string[] | undefined,
): boolean {
  return normalizeSetCookie(setCookie).some((cookie) => {
    const [pair] = cookie.split(';');
    const [name, value] = (pair ?? '').split('=');

    return Boolean(name?.includes('_') && value);
  });
}

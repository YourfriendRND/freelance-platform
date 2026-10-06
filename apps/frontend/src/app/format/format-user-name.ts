export function formatUserName(user: {
  firstName: string;
  lastName?: string | null;
}): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}

export function buildSalt(randomSalt: string, saltWord: string): string {
  return `${randomSalt}:${saltWord}`;
}

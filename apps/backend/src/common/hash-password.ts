import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { buildSalt } from './build-salt';

const scryptAsync = promisify(scrypt);


export async function hashPassword(password: string, saltWord: string): Promise<string> {
  const randomSalt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, buildSalt(randomSalt, saltWord), 64)) as Buffer;

  return `${randomSalt}:${derivedKey.toString('hex')}`;
}

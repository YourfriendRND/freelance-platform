import {  scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { buildSalt } from './build-salt';

const scryptAsync = promisify(scrypt);

export async function verifyPassword(
  password: string,
  passwordHash: string,
  saltWord: string,
): Promise<boolean> {
  if (!passwordHash) {
    return false;
  }

  const [randomSalt, storedHex] = passwordHash.split(':');
  
  if (!randomSalt || !storedHex) {
    return false;
  }

  const derivedKey = (await scryptAsync(
    password,
    buildSalt(randomSalt, saltWord),
    64,
  )) as Buffer;

  const stored = Buffer.from(storedHex, 'hex');

  if (stored.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(stored, derivedKey);
}

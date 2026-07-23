import { ClassConstructor, plainToInstance } from 'class-transformer';

export function fillRdo<T, D>(rdo: ClassConstructor<T>, data: D[]): T[];
export function fillRdo<T, D>(rdo: ClassConstructor<T>, data: D): T;
export function fillRdo<T, D>(
  rdo: ClassConstructor<T>,
  data: D | D[],
): T | T[] {
  return plainToInstance(rdo, data, {
    excludeExtraneousValues: true,
  });
}

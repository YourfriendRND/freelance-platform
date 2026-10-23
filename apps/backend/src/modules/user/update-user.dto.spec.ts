import { validate } from 'class-validator';
import { UpdateUserDto } from '@freelance-platform/shared-dto';

function createDto(data: Partial<UpdateUserDto>): UpdateUserDto {
  return Object.assign(new UpdateUserDto(), data);
}

describe('UpdateUserDto testing', () => {
  it('should reject a future birthday', async () => {
    const errors = await validate(createDto({ birthday: '2999-01-01' }));
    const [error] = errors;

    expect(error?.constraints?.isBirthday).toBe('Дата рождения не может быть в будущем');
  });

  it('should reject an invalid calendar date', async () => {
    const errors = await validate(createDto({ birthday: '2026-02-31' }));
    const [error] = errors;

    expect(error?.constraints?.isBirthday).toBe('Некорректная дата рождения');
  });

  it('should allow an empty birthday', async () => {
    const errors = await validate(createDto({ birthday: null }));

    expect(errors).toHaveLength(0);
  });

  it('should reject a negative rate', async () => {
    const errors = await validate(createDto({ rate: -1 }));

    expect(errors.some((error) => error.property === 'rate')).toBe(true);
  });

  it('should reject a null first name', async () => {
    const errors = await validate(createDto({ firstName: null as unknown as string }));

    expect(errors.some((error) => error.property === 'firstName')).toBe(true);
  });
});

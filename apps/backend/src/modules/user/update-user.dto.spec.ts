import { validate } from 'class-validator';
import { UpdateUserDto } from '@freelance-platform/shared-dto';
import { SKILL_NAME_MAX_LENGTH } from '@freelance-platform/shared-types';

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

  it('should reject an empty skill name', async () => {
    const errors = await validate(createDto({ skills: [''] }));
    const [error] = errors;

    expect(error?.property).toBe('skills');
    expect(error?.constraints?.minLength).toBe('Название навыка не может быть пустым');
  });

  it('should reject a skill name longer than the limit', async () => {
    const errors = await validate(createDto({ skills: ['a'.repeat(SKILL_NAME_MAX_LENGTH + 1)] }));
    const [error] = errors;

    expect(error?.property).toBe('skills');
    expect(error?.constraints?.maxLength).toBe(
      `Название навыка не длиннее ${SKILL_NAME_MAX_LENGTH} символов`,
    );
  });

  it('should reject a null first name', async () => {
    const errors = await validate(createDto({ firstName: null as unknown as string }));

    expect(errors.some((error) => error.property === 'firstName')).toBe(true);
  });
});

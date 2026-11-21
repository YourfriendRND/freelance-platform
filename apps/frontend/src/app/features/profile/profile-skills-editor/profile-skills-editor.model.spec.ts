import { USER_SKILL_MAX_COUNT } from '@freelance-platform/shared-types';
import {
  canonicalSkillName,
  isSkillDraftLengthValid,
  SKILL_LIMIT_MESSAGE,
  SKILL_NAME_DUPLICATE_MESSAGE,
  SKILL_NAME_TOO_LONG_MESSAGE,
  SKILL_NAME_TOO_SHORT_MESSAGE,
  skillDraftMessage,
  toSkillOptions,
} from './profile-skills-editor.model';

describe('profile skills editor model testing', () => {
  const suggestions = [{ name: 'TypeScript' }, { name: 'Figma' }];

  it('should accept a trimmed name from 2 to 50 characters', () => {
    expect(isSkillDraftLengthValid(' a ')).toBe(false);
    expect(isSkillDraftLengthValid('  UI ')).toBe(true);
    expect(isSkillDraftLengthValid('a'.repeat(50))).toBe(true);
    expect(isSkillDraftLengthValid(` ${'a'.repeat(51)} `)).toBe(false);
  });

  it('should use the suggestion name when the draft matches regardless of case', () => {
    expect(canonicalSkillName('  typescript ', suggestions)).toBe('TypeScript');
    expect(canonicalSkillName('  UX  ', suggestions)).toBe('UX');
  });

  it('should mark suggestions that are already selected', () => {
    expect(toSkillOptions(suggestions, ['typescript'])).toEqual([
      { name: 'TypeScript', added: true },
      { name: 'Figma', added: false },
    ]);
  });

  it('should explain why a draft cannot be added', () => {
    const skills = Array.from({ length: USER_SKILL_MAX_COUNT }, (_, index) => `Skill ${index}`);

    expect(skillDraftMessage(' a ', [])).toBe(SKILL_NAME_TOO_SHORT_MESSAGE);
    expect(skillDraftMessage('a'.repeat(51), [])).toBe(SKILL_NAME_TOO_LONG_MESSAGE);
    expect(skillDraftMessage(' typescript ', ['TypeScript'])).toBe(SKILL_NAME_DUPLICATE_MESSAGE);
    expect(skillDraftMessage('Angular', skills)).toBe(SKILL_LIMIT_MESSAGE);
    expect(skillDraftMessage(' Angular ', skills.slice(0, -1))).toBeNull();
  });
});

import {
  SKILL_NAME_MAX_LENGTH,
  SKILL_QUERY_MIN_LENGTH,
  USER_SKILL_MAX_COUNT,
} from '@freelance-platform/shared-types';

export type ProfileSkillSuggestion = {
  readonly name: string;
};

export type ProfileSkillOption = {
  readonly name: string;
  readonly added: boolean;
};

export const SKILL_SEARCH_DEBOUNCE_MS = 300;
export const SKILL_SEARCH_ERROR = 'Не удалось найти навыки';
export const SKILL_NAME_TOO_SHORT_MESSAGE = `Минимум ${SKILL_QUERY_MIN_LENGTH} символа`;
export const SKILL_NAME_TOO_LONG_MESSAGE = `Максимум ${SKILL_NAME_MAX_LENGTH} символов`;
export const SKILL_NAME_DUPLICATE_MESSAGE = 'Навык уже добавлен';
export const SKILL_LIMIT_MESSAGE = `Не больше ${USER_SKILL_MAX_COUNT} навыков`;

export function isSkillDraftLengthValid(draft: string): boolean {
  const length = draft.trim().length;

  return length >= SKILL_QUERY_MIN_LENGTH && length <= SKILL_NAME_MAX_LENGTH;
}

export function canonicalSkillName(
  draft: string,
  suggestions: readonly ProfileSkillSuggestion[],
): string {
  const match = suggestions.find((suggestion) => isSameSkillName(suggestion.name, draft));

  return match ? match.name : draft.trim();
}

export function toSkillOptions(
  suggestions: readonly ProfileSkillSuggestion[],
  skills: readonly string[],
): readonly ProfileSkillOption[] {
  return suggestions.map((suggestion) => ({
    name: suggestion.name,
    added: skills.some((skill) => isSameSkillName(skill, suggestion.name)),
  }));
}

export function skillDraftMessage(name: string, skills: readonly string[]): string | null {
  const normalized = name.trim();

  if (normalized.length < SKILL_QUERY_MIN_LENGTH) {
    return SKILL_NAME_TOO_SHORT_MESSAGE;
  }

  if (normalized.length > SKILL_NAME_MAX_LENGTH) {
    return SKILL_NAME_TOO_LONG_MESSAGE;
  }

  if (skills.some((skill) => isSameSkillName(skill, normalized))) {
    return SKILL_NAME_DUPLICATE_MESSAGE;
  }

  if (skills.length >= USER_SKILL_MAX_COUNT) {
    return SKILL_LIMIT_MESSAGE;
  }

  return null;
}

function isSameSkillName(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

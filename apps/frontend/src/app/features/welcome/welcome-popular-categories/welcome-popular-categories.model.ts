import { PopularTaskCategory } from '@freelance-platform/shared-types';

const FULL_COUNT = 8;
const SHORT_COUNT = 4;

export function selectPopularCategories(
  categories: readonly PopularTaskCategory[],
): readonly PopularTaskCategory[] {
  const withTasks = categories.filter((category) => category.taskCount > 0);

  if (withTasks.length >= FULL_COUNT) {
    return withTasks.slice(0, FULL_COUNT);
  }

  if (withTasks.length >= SHORT_COUNT) {
    return withTasks.slice(0, SHORT_COUNT);
  }

  return [];
}

export function formatPopularTaskCount(count: number): string {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  let word = 'задач';

  if (mod10 === 1 && mod100 !== 11) {
    word = 'задача';
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = 'задачи';
  }

  return `${count} ${word}`;
}

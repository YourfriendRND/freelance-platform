import {
  formatPopularTaskCount,
  selectPopularCategories,
} from './welcome-popular-categories.model';
import { createMockCategory } from './welcome-popular-categories.mock';

describe('welcome popular categories model', () => {
  it('should keep the first 8 categories that have tasks', () => {
    const categories = Array.from({ length: 10 }, (_, index) => createMockCategory(index));

    expect(selectPopularCategories(categories).map((item) => item.id)).toEqual([
      'category-0',
      'category-1',
      'category-2',
      'category-3',
      'category-4',
      'category-5',
      'category-6',
      'category-7',
    ]);
  });

  it('should keep the first 4 when fewer than 8 categories have tasks', () => {
    const categories = [
      createMockCategory(0, 0),
      createMockCategory(1, 4),
      createMockCategory(2, 3),
      createMockCategory(3, 2),
      createMockCategory(4, 1),
      createMockCategory(5, 6),
    ];

    expect(selectPopularCategories(categories).map((item) => item.title)).toEqual([
      'Категория 1',
      'Категория 2',
      'Категория 3',
      'Категория 4',
    ]);
  });

  it('should hide the block when fewer than 4 categories have tasks', () => {
    expect(selectPopularCategories([createMockCategory(0), createMockCategory(1, 0), createMockCategory(2)])).toEqual([]);
  });

  it('should format the task count', () => {
    expect(formatPopularTaskCount(1)).toBe('1 задача');
    expect(formatPopularTaskCount(2)).toBe('2 задачи');
    expect(formatPopularTaskCount(5)).toBe('5 задач');
    expect(formatPopularTaskCount(11)).toBe('11 задач');
    expect(formatPopularTaskCount(21)).toBe('21 задача');
  });
});

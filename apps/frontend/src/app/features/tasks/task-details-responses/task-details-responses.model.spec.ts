import { createMockTaskApplicationResponse, createMockUserResponse } from '@freelance-platform/shared-mock';
import { toTaskDetailsResponseCard } from './task-details-responses.model';

describe('toTaskDetailsResponseCard function testing', () => {
  it('should keep the performer avatar address from the application user', () => {
    const card = toTaskDetailsResponseCard(
      createMockTaskApplicationResponse({
        user: createMockUserResponse({
          firstName: 'Мария',
          lastName: 'Сидорова',
          avatarUrl: 'https://cdn.example/avatar.jpg',
          skills: [{ id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' }],
        }),
      }),
    );

    expect(card.performerName).toBe('Мария Сидорова');
    expect(card.avatarUrl).toBe('https://cdn.example/avatar.jpg');
    expect(card).not.toHaveProperty('skills');
    expect(Object.values(card).join(' ')).not.toContain('TypeScript');
  });

  it('should keep a missing avatar address as null', () => {
    const card = toTaskDetailsResponseCard(createMockTaskApplicationResponse());

    expect(card.avatarUrl).toBeNull();
  });
});

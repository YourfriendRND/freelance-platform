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
        }),
      }),
    );

    expect(card.performerName).toBe('Мария Сидорова');
    expect(card.avatarUrl).toBe('https://cdn.example/avatar.jpg');
  });

  it('should keep a missing avatar address as null', () => {
    const card = toTaskDetailsResponseCard(createMockTaskApplicationResponse());

    expect(card.avatarUrl).toBeNull();
  });
});

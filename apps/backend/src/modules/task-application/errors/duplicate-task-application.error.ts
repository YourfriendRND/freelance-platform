export class DuplicateTaskApplicationError extends Error {
  override readonly name = 'DuplicateTaskApplicationError';

  constructor() {
    super('Отклик на эту задачу от этого исполнителя уже существует');
  }
}

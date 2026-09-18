import { HttpErrorResponse } from '@angular/common/http';
import { resolveHttpErrorMessage } from '@freelance-platform/http';

describe('resolveHttpErrorMessage testing', () => {
  const fallback = 'Не удалось войти';

  it('should return a string message from the HTTP error body', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { message: 'Неверный email или пароль' },
    });

    expect(resolveHttpErrorMessage(error, fallback)).toBe(
      'Неверный email или пароль',
    );
  });

  it('should return the first message from an array', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: ['Обязательное поле', 'Введите корректный email'] },
    });

    expect(resolveHttpErrorMessage(error, fallback)).toBe('Обязательное поле');
  });

  it('should return the fallback when the error is not an HTTP response', () => {
    expect(resolveHttpErrorMessage(new Error('network'), fallback)).toBe(
      fallback,
    );
  });

  it('should return the fallback when the HTTP message is empty', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { message: '   ' },
    });

    expect(resolveHttpErrorMessage(error, fallback)).toBe(fallback);
  });
});

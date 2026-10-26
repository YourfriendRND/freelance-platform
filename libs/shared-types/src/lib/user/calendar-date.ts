export const INVALID_BIRTHDAY_MESSAGE = 'Некорректная дата рождения';
export const FUTURE_BIRTHDAY_MESSAGE = 'Дата рождения не может быть в будущем';

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export function readCalendarDate(value: unknown): CalendarDate | null {
  if (typeof value !== 'string') {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isRealDate) {
    return null;
  }

  return { year, month, day };
}

export function isFutureCalendarDate(date: CalendarDate): boolean {
  const today = new Date();
  const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const valueKey = date.year * 10000 + date.month * 100 + date.day;

  return valueKey > todayKey;
}

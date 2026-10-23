import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const INVALID_BIRTHDAY_MESSAGE = 'Некорректная дата рождения';
const FUTURE_BIRTHDAY_MESSAGE = 'Дата рождения не может быть в будущем';

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function readCalendarDate(value: unknown): CalendarDate | null {
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

function isFutureDate(date: CalendarDate): boolean {
  const today = new Date();
  const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const valueKey = date.year * 10000 + date.month * 100 + date.day;

  return valueKey > todayKey;
}

export function IsBirthday(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isBirthday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const date = readCalendarDate(value);

          return date !== null && !isFutureDate(date);
        },
        defaultMessage(args: ValidationArguments) {
          const date = readCalendarDate(args.value);

          return date === null ? INVALID_BIRTHDAY_MESSAGE : FUTURE_BIRTHDAY_MESSAGE;
        },
      },
    });
  };
}

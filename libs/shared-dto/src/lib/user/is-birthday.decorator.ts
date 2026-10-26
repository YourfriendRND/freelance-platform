import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import {
  FUTURE_BIRTHDAY_MESSAGE,
  INVALID_BIRTHDAY_MESSAGE,
  isFutureCalendarDate,
  readCalendarDate,
} from '@freelance-platform/shared-types';

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

          return date !== null && !isFutureCalendarDate(date);
        },
        defaultMessage(args: ValidationArguments) {
          const date = readCalendarDate(args.value);

          return date === null ? INVALID_BIRTHDAY_MESSAGE : FUTURE_BIRTHDAY_MESSAGE;
        },
      },
    });
  };
}

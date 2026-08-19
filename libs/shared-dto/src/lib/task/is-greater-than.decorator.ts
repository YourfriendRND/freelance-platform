import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;

          if (typeof relatedPropertyName !== 'string') {
            return false;
          }

          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          return typeof value === 'number' && typeof relatedValue === 'number' && value > relatedValue;
        },
      },
    });
  };
}

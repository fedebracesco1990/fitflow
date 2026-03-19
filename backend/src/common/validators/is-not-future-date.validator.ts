import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString) {
      return true;
    }

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return date <= today;
  }

  defaultMessage(): string {
    return 'La fecha de pago no puede ser una fecha futura';
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

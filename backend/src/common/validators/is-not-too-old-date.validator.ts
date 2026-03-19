import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const MAX_DAYS_IN_PAST = 90;

@ValidatorConstraint({ name: 'isNotTooOldDate', async: false })
export class IsNotTooOldDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString) {
      return true;
    }

    const date = new Date(dateString);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - MAX_DAYS_IN_PAST);
    minDate.setHours(0, 0, 0, 0);

    return date >= minDate;
  }

  defaultMessage(): string {
    return `La fecha de pago no puede ser anterior a ${MAX_DAYS_IN_PAST} días`;
  }
}

export function IsNotTooOldDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotTooOldDateConstraint,
    });
  };
}

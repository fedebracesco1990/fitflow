import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isWithinCoveragePeriod', async: false })
export class IsWithinCoveragePeriodConstraint implements ValidatorConstraintInterface {
  validate(paymentDate: string, args: ValidationArguments): boolean {
    const [startProp, endProp] = args.constraints as [string, string];
    const obj = args.object as Record<string, unknown>;

    const coverageStart = obj[startProp] as string;
    const coverageEnd = obj[endProp] as string;

    if (!paymentDate || !coverageStart || !coverageEnd) {
      return true;
    }

    const payment = new Date(paymentDate);
    const start = new Date(coverageStart);
    const end = new Date(coverageEnd);

    return payment >= start && payment <= end;
  }

  defaultMessage(): string {
    return 'La fecha de pago debe estar dentro del período de cobertura (coverageStartDate - coverageEndDate)';
  }
}

export function IsWithinCoveragePeriod(
  startProperty: string,
  endProperty: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [startProperty, endProperty],
      validator: IsWithinCoveragePeriodConstraint,
    });
  };
}

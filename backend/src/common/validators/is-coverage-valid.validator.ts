import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCoverageValid', async: false })
export class IsCoverageValidConstraint implements ValidatorConstraintInterface {
  validate(coverageEndDate: string, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];
    const coverageStartDate = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ] as string;

    if (!coverageStartDate || !coverageEndDate) {
      return true;
    }

    const startDate = new Date(coverageStartDate);
    const endDate = new Date(coverageEndDate);

    return endDate >= startDate;
  }

  defaultMessage(): string {
    return 'La fecha de fin de cobertura debe ser posterior o igual a la fecha de inicio';
  }
}

export function IsCoverageValid(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsCoverageValidConstraint,
    });
  };
}

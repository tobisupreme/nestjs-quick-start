import { Injectable } from '@nestjs/common';
import {
  buildMessage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import moment from 'moment';

interface IsDurationConstraints {
  unit?: moment.unitOfTime.Base;
}
@Injectable()
@ValidatorConstraint({ name: 'IsDuration', async: true })
export class IsDurationRule implements ValidatorConstraintInterface {
  async validate(value: string) {
    return moment.duration(value).isValid();
  }

  defaultMessage(args: ValidationArguments) {
    const messageBuilder = buildMessage(
      (prefix) =>
        `${prefix}$property is not a valid Duration. ${prefix}$property must be a val Duration string e.g P1D - one day; PT2H30M - two hours, 30 minutes, e.t.c . See https://tc39.es/proposal-temporal/docs/duration.html.`,
    );

    return messageBuilder(args);
  }
}

export function IsDuration(
  constraints?: IsDurationConstraints,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsDuration',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsDurationRule,
      constraints: [constraints],
    });
  };
}

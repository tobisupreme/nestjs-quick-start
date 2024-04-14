import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  buildMessage,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsJsonObject', async: true })
export class IsJsonObjectRule implements ValidatorConstraintInterface {
  validate(value: any) {
    console.log(
      '🚀 ~ file: is-json-object.decorator.ts:15 ~ IsJsonObjectRule ~ validate ~ value:',
      value,
    );
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        return false;
      }
    }
    return value && typeof value === 'object';
  }

  defaultMessage(args: ValidationArguments) {
    const messageBuilder = buildMessage(
      (prefix) => 'Text ($value) must be a json string or object',
    );

    return messageBuilder(args);
  }
}

export function IsJsonObject(
  constraints?: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsJsonObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsJsonObjectRule,
      constraints: [constraints],
    });
  };
}

import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import {
  ClassConstructor,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class BackendValidationPipe implements PipeTransform {
  async transform(value: Record<string, any>, metadata: ArgumentMetadata) {
    const metatype: ClassConstructor<any> = metadata.metatype as Type<any>;

    const obj: typeof metatype = plainToInstance<
      typeof metatype,
      Record<string, any>
    >(metatype, value);

    if (typeof obj !== 'object') {
      return value;
    }
    const errors = await validate(obj, {
      forbidUnknownValues: false,
    });

    if (errors.length === 0) {
      return value;
    }
    const errorsDesc = this.formatErrors(errors);
    throw new HttpException(
      { errors: errorsDesc },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  private formatErrors(validationErrors: ValidationError[]) {
    return validationErrors.reduce((acc, curr: ValidationError) => {
      const errors: string[] = Object.values(
        curr.constraints as Record<string, string>,
      );
      acc[curr.property] = errors;
      return acc;
    }, {});
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

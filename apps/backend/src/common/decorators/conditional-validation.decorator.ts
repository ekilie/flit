import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmpty,
} from 'class-validator';

/**
 * Conditionally marks a property as optional depending on another property's value.
 *
 * Contract
 * - When the related property has any of the provided values, this field is considered optional
 *   and always passes this validator (other validators can still apply).
 * - Otherwise, the field is required and must not be undefined, null, or an empty string ('').
 *   Note: 0 and false are considered valid values.
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that make the decorated field optional when matched via strict equality (===)
 * - validationOptions: standard class-validator options (message, groups, each, etc.)
 *
 * Examples
 * - Email required unless user signs in with SSO
 *   class CreateUserDto {
 *     @IsEnum(UserProvider)
 *     provider: UserProvider;
 *
 *     @IsOptionalWhen('provider', [UserProvider.SSO], { message: 'Email is required for local accounts' })
 *     @IsEmail()
 *     email?: string;
 *   }
 *
 * - Numeric example: age required unless type is 'guest'
 *   class PersonDto {
 *     type: 'guest' | 'member';
 *     @IsOptionalWhen('type', ['guest'])
 *     @IsInt()
 *     age?: number; // age may be 0, and that's allowed when required
 *   }
 *
 * Notes
 * - This decorator does not support deep property paths (e.g., 'profile.type'). Use a custom validator if needed.
 * - Combine with other validators (e.g., IsEmail, IsInt) to enforce format when the field is present or required.
 */
export function IsOptionalWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOptionalWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is optional
          if (relatedValues.includes(relatedValue)) {
            return true; // Allow any value including undefined/null
          }

          // Otherwise, this field is required
          return value !== undefined && value !== null && value !== '';
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is not one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Conditionally requires a property depending on another property's value.
 *
 * Contract
 * - When the related property has any of the provided values, this field becomes required and must
 *   not be undefined, null, or an empty string (''). Note: 0 and false are considered valid values.
 * - Otherwise, the field is optional for this validator (other validators can still apply).
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that make the decorated field required when matched via strict equality (===)
 * - validationOptions: standard class-validator options (message, groups, each, etc.)
 *
 * Examples
 * - Password required for local provider, optional for SSO
 *   class LoginDto {
 *     provider: 'local' | 'sso';
 *
 *     @IsRequiredWhen('provider', ['local'], { message: 'Password is required for local login' })
 *     @IsString()
 *     password?: string;
 *   }
 *
 * - Reason required when status is 'rejected'
 *   class ReviewDto {
 *     status: 'pending' | 'approved' | 'rejected';
 *     @IsRequiredWhen('status', ['rejected'])
 *     @IsString()
 *     reason?: string;
 *   }
 */
export function IsRequiredWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRequiredWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is required
          if (relatedValues.includes(relatedValue)) {
            return value !== undefined && value !== null && value !== '';
          }

          // Otherwise, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Ensures a property is empty when another property has certain values.
 *
 * Empty is determined by class-validator's isEmpty: undefined, null, or an empty string ('').
 * Arrays and objects are NOT considered empty by this check.
 *
 * Use cases
 * - Prevent contradictory input (e.g., manual reason provided while status is auto-approved).
 * - Enforce mutual exclusivity with fields controlled by system logic.
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that require the decorated field to be empty when matched via strict equality (===)
 * - validationOptions: standard class-validator options
 *
 * Example
 *   class ApprovalDto {
 *     status: 'auto' | 'manual';
 *
 *     @IsEmptyWhen('status', ['auto'], { message: 'manualReason must not be provided for auto status' })
 *     manualReason?: string;
 *   }
 *
 * Tip
 * - Often paired with IsOptionalWhen on the same field when you want it both optional and forced empty for certain statuses.
 */
export function IsEmptyWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmptyWhen',
      target: object.constructor,
      propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (relatedValues.includes(relatedValue)) {
            return isEmpty(value);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} must be empty when ${relatedPropertyName} is one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Asserts that a property's value strictly equals (===) another property's value.
 *
 * Typical usage is confirming inputs like password/confirmPassword or email/emailConfirm.
 * Matching is strict (===) and not deep; for objects/arrays it checks reference equality.
 *
 * Parameters
 * - property: name of the sibling property to compare against (simple property name; nested paths are not resolved)
 * - validationOptions: standard class-validator options
 *
 * Example
 *   class RegisterDto {
 *     @IsString()
 *     password: string;
 *
 *     @MatchesField('password', { message: 'Passwords do not match' })
 *     confirmPassword: string;
 *   }
 *
 * Notes
 * - If you need case-insensitive or trimmed comparison, pre-normalize values (e.g., via Transform) before validation.
 */
export function MatchesField(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'matchesField',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

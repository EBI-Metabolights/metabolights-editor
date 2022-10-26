import { AbstractControl, ValidatorFn } from '@angular/forms';
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
export function ValidateRules(field: string, validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    let invalid = false;
    let errorMessage = '';
    validation.rules.forEach((rule) => {
      switch (rule.condition) {
        case 'min': {
          if (
            value.toString().length < rule.value &&
            JSON.parse(validation['is-required'])
          ) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
        case 'pattern': {
          const re = new RegExp(rule.value, 'i');
          if (value !== '' && !re.test(value)) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
        case 'array_min': {
          if (
            value.length < rule.value &&
            JSON.parse(validation['is-required'])
          ) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
      }
    });

    if (invalid) {
      return { [field]: { error: errorMessage } };
    }
    return null;
  };
}

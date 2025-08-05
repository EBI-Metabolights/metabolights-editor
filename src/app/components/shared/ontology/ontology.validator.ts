import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
export function ValidateRules(field: string, validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      switch (rule.condition) {
        case "min": {
          if (
            value.toString().length < rule.value &&
            JSON.parse(validation["is-required"])
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

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if(!control.value) {
      return null; // No value, no validation error
    }
    try{
      new URL(control.value);
      return null; // Valid URL
    } catch (e) {
      return { 'invalidUrl': true }; // Invalid URL  
    }
  }  
}

export function notANumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return !isNaN(value) && value.trim() !== '' ? { numberNotAllowed: true } : null;
  };
}

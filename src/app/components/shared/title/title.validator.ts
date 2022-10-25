import { AbstractControl, ValidatorFn } from "@angular/forms";

export function ValidateStudyTitle(validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      switch (rule.condition) {
        case "min": {
          if (value.toString().length < rule.value) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
      }
    });

    if (invalid) {
      return { title: { error: errorMessage } };
    }
    return null;
  };
}

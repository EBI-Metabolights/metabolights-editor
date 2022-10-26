import { AbstractControl, ValidatorFn } from "@angular/forms";
/* eslint-disable prefer-arrow/prefer-arrow-functions */

function strip(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function validateStudyDescription(validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      switch (rule.condition) {
        case "min": {
          if (strip(value).toString().length < rule.value) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
      }
    });

    if (invalid) {
      return { description: { error: errorMessage } };
    }
    return null;
  };
}

import { AbstractControl, ValidatorFn } from "@angular/forms";

/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
function strip(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function ValidateRules(field: string, validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      if (value !== null) {
        switch (rule.condition) {
          case "min": {
            if (
              strip(value.toString()).length < rule.value &&
              JSON.parse(validation["is-required"])
            ) {
              invalid = true;
              errorMessage = errorMessage + rule.error;
            }
            break;
          }
          case "pattern": {
            const re = new RegExp(rule.value, "i");
            if (!re.test(value)) {
              invalid = true;
              errorMessage = errorMessage + rule.error;
            }
            break;
          }
        }
      }
    });
    if (invalid) {
      return { [field]: { error: errorMessage } };
    }
    return null;
  };
}

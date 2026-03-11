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
    if (!validation || !validation.rules) {
      return null;
    }
    const value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      const valStr = value !== null && value !== undefined ? value.toString() : "";
      const strippedValue = strip(valStr).trim();
      
      switch (rule.condition) {
        case "min": {
          const isRequired = validation["is-required"] === true || validation["is-required"] === "true";
          if (strippedValue.length < rule.value && isRequired) {
            invalid = true;
            errorMessage = errorMessage + rule.error;
          }
          break;
        }
        case "pattern": {
          const re = new RegExp(rule.value, "i");
          if (!re.test(valStr)) {
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

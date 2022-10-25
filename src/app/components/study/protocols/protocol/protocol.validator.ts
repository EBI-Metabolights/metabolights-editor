import { AbstractControl, ValidatorFn } from "@angular/forms";

export function ValidateRules(field: string, validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let value = control.value;
    let invalid = false;
    let errorMessage = "";

    validation.rules.forEach((rule) => {
      if (value != null) {
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
            let re = new RegExp(rule.value, "i");
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

  function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
}

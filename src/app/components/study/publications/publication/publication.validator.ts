import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */

function formatValidationMessage(template: string, ctx: Record<string, any> = {}): string {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = ctx[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function ValidateRules(field: string, validation: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    let invalid = false;
    let errorMessage = "";

    const isRequired = JSON.parse(validation?.["is-required"] || "false");

    const isEmpty = (v: any) =>
      v === null ||
      v === undefined ||
      (typeof v === "string" && v.trim() === "") ||
      (Array.isArray(v) && v.length === 0);

    if (isRequired && isEmpty(value)) {
      const reqRule =
        (validation.rules || []).find((r) => ["array_min", "min", "required"].includes(r.condition)) ||
        null;
      if (reqRule) {
        const actual = Array.isArray(value) ? (value || []).length : (value ? String(value).length : 0);
        errorMessage = formatValidationMessage(reqRule.error, {
          value: reqRule.value,
          field,
          actual,
          input: Array.isArray(value) ? JSON.stringify(value) : value,
        });
      } else {
        errorMessage = formatValidationMessage("The {field} field is required.", { field });
      }
      return { [field]: { error: errorMessage } };
    }

    (validation.rules || []).forEach((rule) => {
      switch (rule.condition) {
        case "min": {
          const valStr = value === null || value === undefined ? "" : String(value);
          const minExpected = Number(rule.value || 0);
          const actual = valStr.length;
          if (valStr !== "" && actual < minExpected) {
            invalid = true;
            errorMessage +=
              formatValidationMessage(rule.error, {
                value: rule.value,
                field,
                actual,
                input: valStr,
              }) + " ";
          }
          break;
        }
        case "pattern": {
          const valStr = value === null || value === undefined ? "" : String(value);
          const re = new RegExp(rule.value, "i");
          if (valStr !== "" && !re.test(valStr)) {
            invalid = true;
            errorMessage +=
              formatValidationMessage(rule.error, {
                value: rule.value,
                field,
                actual: valStr.length,
                input: valStr,
              }) + " ";
          }
          break;
        }
        case "array_min": {
          const arrLen = Array.isArray(value) ? value.length : 0;
          const minExpected = Number(rule.value || 0);
          if (arrLen > 0 && arrLen < minExpected) {
            invalid = true;
            errorMessage +=
              formatValidationMessage(rule.error, {
                value: rule.value,
                field,
                actual: arrLen,
                input: JSON.stringify(value),
              }) + " ";
          }
          break;
        }
      }
    });

    if (invalid) {
      return { [field]: { error: errorMessage.trim() } };
    }
    return null;
  };
}

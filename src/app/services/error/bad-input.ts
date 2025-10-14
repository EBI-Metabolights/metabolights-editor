import * as toastr from "toastr";

export class BadInput {
  constructor(error: any) {
    
    const errorsArray: string[] =
      (error.error?.errors && Array.isArray(error.error.errors))
        ? error.error.errors
        : [];

    if (errorsArray.length === 0) {
      const singleMsg =
        error.error?.err || error.error?.message || error.message || "Invalid input value";
      errorsArray.push(singleMsg);
    }

    const errorStatus = error.statusText ? error.statusText : "Validation Error";

    errorsArray.forEach((msg, index) => {
        toastr.error(msg, errorStatus, {
          timeOut: 5000,
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: true,
        });
    });

    return error;
  }
}


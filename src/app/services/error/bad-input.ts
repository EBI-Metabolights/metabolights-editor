import * as toastr from "toastr";

export class BadInput {
  constructor(error: any) {
    let errorMessage = error.error.err
    if (!errorMessage) {
      errorMessage = error.error?.message
    }
    if (!errorMessage) {
      errorMessage = error.message
    }
    if (!errorMessage) {
      errorMessage = "Invalid input value"
    }
    const errorStatus = error.statusText ? error.statusText : "";
    toastr.error(errorMessage, errorStatus, {
      timeOut: "5000",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: true,
    });
    return error;
  }
}

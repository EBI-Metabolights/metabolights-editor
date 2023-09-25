import * as toastr from "toastr";
export class PermissionError {
  constructor(error: any) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "Unauthorised access.";
    const errorStatus = error.statusText ? error.statusText : "";

    toastr.warning(errorMessage, errorStatus, {
      timeOut: "1000",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: true,
    });
    return error;
  }
}

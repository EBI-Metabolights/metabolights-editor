import * as toastr from "toastr";
export class ForbiddenError {
  constructor(error: any) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "Restricted access.";
    toastr.warning(errorMessage, "", {
      timeOut: "6000",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: true,
    });
    return error;
  }
}

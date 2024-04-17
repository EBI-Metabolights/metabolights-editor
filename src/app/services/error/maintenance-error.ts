import * as toastr from "toastr";


export class MaintenanceError {
  constructor(error: any = null) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "MetaboLights is under maintenance. Please try later.";
    const errorStatus = error.statusText ? error.statusText : "";
    toastr.error(
      errorMessage,
      errorStatus,
      {
        timeOut: "5000",
        positionClass: "toast-bottom-right",
        preventDuplicates: true,
        extendedTimeOut: 0,
      }
    );
    return error;
  }
}

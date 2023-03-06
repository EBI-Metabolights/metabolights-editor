import * as toastr from "toastr";
export class AppError {
  constructor(error: any) {
    console.log(error);
    if (error) {
      const errorMessage = error.error.message
        ? error.error.message
        : error.message ? error.message
          : "Could not connect to MetaboLights. We will keep trying to connect but there may be a problem with your connection.";

      const errorStatus = error.statusText ? error.statusText : "";
      toastr.warning(errorMessage, errorStatus, {
        timeOut: "5000",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
      });
    }
    return error;
  }
}

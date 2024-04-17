import * as toastr from "toastr";


export class InternalServerError {
  constructor(error: any = null) {
    const errorMessage = error.error.message
      ? error.error.message
      : error.message ? error.message : "Internal server error.";
    toastr.warning(
      errorMessage +
        ' <a href="mailto:metabolights-help@ebi.ac.uk">Contact us</a> if the problem persist.',
      "",
      {
        timeOut: "0",
        positionClass: "toast-bottom-right",
        preventDuplicates: true,
        extendedTimeOut: 0,
      }
    );
    return error;
  }
}

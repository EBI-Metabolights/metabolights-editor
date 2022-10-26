import * as toastr from 'toastr';

export class BadInput {
  constructor(error: any) {
    const errorMessage = error.message
      ? error.message
      : 'Bad request input error';
    const errorStatus = error.statusText ? error.statusText : '';
    toastr.warning(errorMessage, errorStatus, {
      timeOut: '1000',
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: true,
    });
    return error;
  }
}

import * as toastr from 'toastr';
export class ForbiddenError {
	constructor(error: any){
		toastr.warning(error.message, '', {
            "timeOut": "1000",
            "positionClass": "toast-top-center",
  			"preventDuplicates": true,
  			"extendedTimeOut": 0,
  			"tapToDismiss": true
        })
        return error;
	}	
}
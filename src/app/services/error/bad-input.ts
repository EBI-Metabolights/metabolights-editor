import * as toastr from 'toastr';

export class BadInput {
	constructor(error: any){
		let errorMessage = error.json().message ? error.json().message : 'Bad request input error'
	    let errorStatus = error.json().statusText ? error.json().statusText : ''
		toastr.warning( errorMessage, errorStatus, {
	    	"timeOut": "1000",
	      	"positionClass": "toast-top-center",
			"preventDuplicates": true,
			"extendedTimeOut": 0,
			"tapToDismiss": true
	    })
	    return error;
	}	
}
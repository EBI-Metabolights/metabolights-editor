import * as toastr from 'toastr';
export class AppError {
	constructor(error: any){
		let errorMessage = error.json().message ? error.json().message : 'Could not connect to MetaboLights. We will keep trying to connect but there may be a problem with your connection.'
    	let errorStatus = error.json().statusText ? error.json().statusText : ''
		toastr.warning( errorMessage, errorStatus, {
	      "timeOut": "0",
	      "positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0
	    })
	    return error;
	}	
}
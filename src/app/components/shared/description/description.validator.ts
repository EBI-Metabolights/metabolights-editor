import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ValidateStudyDescription(validation: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
    	let value = control.value;
    	let invalid = false;
    	let errorMessage = "";

    	validation.rules.forEach( rule => {
    		switch(rule.condition) { 
                case "min": { 
                    if (strip(value).toString().length < rule.value){
                        invalid = true
                        errorMessage = errorMessage + rule.error
                    }
                    break; 
                } 
            } 
        })

        if (invalid) {
            return { 'description': { 'error': errorMessage} };
        }
        return null;
    };

    function strip(html)
    {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }
}
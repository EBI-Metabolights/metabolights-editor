import { IAppState } from './../../../store';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../../services/metabolights/auth.service';
import { EditorService } from './../../../services/editor.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NgRedux, select } from '@angular-redux/store';
import { Router } from '@angular/router';
import { MetaboLightsWSURL } from './../../../services/globals';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  isFormBusy: Boolean = false;
  invalidCredentials: Boolean = false;
  domain: string = "";

  constructor(private fb: FormBuilder, private ngRedux: NgRedux<IAppState>, public router: Router, private editorService: EditorService){}

  ngOnInit() {
  	this.ngRedux.dispatch({ type: 'DISABLE_LOADING' })
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      secret: ['', Validators.required]
    });
    this.domain = MetaboLightsWSURL['domain']
  }

  resetForm() {
    this.form.reset();
    this.invalidCredentials = false;
  }

  login(event) {
    event.preventDefault();
    this.isFormBusy = true;
    this.invalidCredentials = false;

    if(this.form.invalid) {
        if(this.form.get('email').value && this.form.get('email').value !=  ''){
          this.form.controls.email.markAsTouched()
        }
        if(this.form.get('secret').value && this.form.get('secret').value !=  ''){
          this.form.controls.secret.markAsTouched()
        }
        this.isFormBusy = false
        return;
    }

    let body = JSON.stringify({ 'email' : this.form.get('email').value, 'secret' :  this.form.get('secret').value});
    this.editorService.login(body).subscribe( response => {
      this.editorService.getValidatedJWTUser(response).subscribe( data => { this.editorService.initialise(data, true); this.router.navigate([this.editorService.redirectUrl]); });
    }, err => {
      if(err.status == 403){
        this.invalidCredentials = true
      }
      this.isFormBusy = false
    });
  }

}

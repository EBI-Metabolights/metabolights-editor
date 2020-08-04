import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'mtbls-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent{

  @select(state => state.status.user) user;

  authUser: any = null;
  query: string = '';

  constructor() { 
    this.user.subscribe(value => { 
        if(value != null){
            this.authUser = value
        }
    });
  }

  sendQuery(){
    window.location.href = '/metabolights/search?freeTextQuery=' + this.query
  }
}

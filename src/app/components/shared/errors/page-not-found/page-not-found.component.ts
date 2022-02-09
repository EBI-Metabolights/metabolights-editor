import { IAppState } from './../../../../store';
import { Component, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private ngRedux: NgRedux<IAppState>) { }

  ngOnInit() {
  	this.ngRedux.dispatch({ type: 'DISABLE_LOADING' })
  }

}

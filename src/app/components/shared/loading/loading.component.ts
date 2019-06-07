import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../.././store';

@Component({
  selector: 'mtbls-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  @select(state => state.status.loading) isLoading: boolean
  @select(state => state.status.info) loadingInformation: string

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mtbls-factors',
  templateUrl: './factors.component.html',
  styleUrls: ['./factors.component.css'],
})
export class FactorsComponent implements OnInit {
  @select((state) => state.study.factors) studyFactors;
  @select((state) => state.study.readonly) readonly;

  isReadOnly = false;
  factors: any = null;

  constructor() {
    if (!environment.isTesting) {
      this.setUpConstructorSubscription();
    }
  }

  ngOnInit() {
    if (!environment.isTesting) {
      this.setUpInitSubscription();
    }
  }

  setUpConstructorSubscription() {
    this.studyFactors.subscribe((value) => {
      this.factors = value;
    });
  }

  setUpInitSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }
}

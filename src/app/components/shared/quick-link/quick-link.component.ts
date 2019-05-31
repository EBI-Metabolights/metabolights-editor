import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import {Router} from "@angular/router";

@Component({
  selector: 'quick-link',
  templateUrl: './quick-link.component.html',
  styleUrls: ['./quick-link.component.css']
})
export class QuickLinkComponent implements OnInit {
	@select(state => state.study.identifier) studyIdentifier;
	@Input('path') path: string;
  @Input('icon') icon: string;
  @Input('text') text: string;
	requestedStudy: string = null;

  constructor(private router: Router) { 
    this.studyIdentifier.subscribe(value => { 
      if(value != null){
        this.requestedStudy = value
      }
    });
  }

  ngOnInit() {
  }

  navigate(){
    this.router.navigate([this.path, this.requestedStudy])
  }
}

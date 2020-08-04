import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'mtbls-download-ftp',
  templateUrl: './ftp.component.html',
  styleUrls: ['./ftp.component.css']
})
export class FtpDownloadComponent implements OnInit {

  @select(state => state.study.identifier) studyIdentifier;

  requestedStudy: any = null;

  constructor() { }

  ngOnInit() {
    this.studyIdentifier.subscribe(value => { 
        if(value != null){
            this.requestedStudy = value
        }
    });
  }

}

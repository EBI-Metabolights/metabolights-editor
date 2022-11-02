import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FTPResponse } from "src/app/models/mtbl/mtbls/interfaces/generics/ftp-response.interface";

@Component({
    selector: 'app-ftp-management',
    template: ''
})
export class MockFtpManagementComponent {

  @Input('calculation') calculation: FTPResponse;
  @Input('ongoingStatus') ongoingStatus: FTPResponse;
  @Input('isSyncing') isSyncing: boolean = false;
  @Input('isCalculating') isCalculating: boolean = false;
  @Input('requestedStudy') requestedStudy: string;

  @Output() checkClicked = new EventEmitter<any>();
  @Output() syncClicked = new EventEmitter<any>();

  @ViewChild('trackHeight') elementView: ElementRef;
}
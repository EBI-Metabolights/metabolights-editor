import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FTPResponse } from 'src/app/models/mtbl/mtbls/interfaces/generics/ftp-response.interface';

@Component({
  selector: 'app-ftp-management',
  templateUrl: './ftp-management.component.html',
  styleUrls: ['./ftp-management.component.css']
})
export class FtpManagementComponent implements OnInit, OnChanges {

  @Input('calculation') calculation: FTPResponse;
  @Input('ongoingStatus') ongoingStatus: FTPResponse;
  @Input('isSyncing') isSyncing: boolean = false;
  @Input('isCalculating') isCalculating: boolean = false;

  @Output() checkClicked = new EventEmitter<any>();
  @Output() syncClicked = new EventEmitter<any>();

  @ViewChild('trackHeight') elementView: ElementRef;
  containerHeight: any = 279;



  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.containerHeight = this.elementView.nativeElement.offsetHeight;
  }

  onCheckClick(): void {
    this.checkClicked.emit();
  }

  onSyncClick(): void {
    this.syncClicked.emit();
  }

}

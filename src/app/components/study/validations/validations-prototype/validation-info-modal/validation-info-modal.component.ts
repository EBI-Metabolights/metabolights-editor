import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Violation } from '../interfaces/validation-report.interface';

@Component({
  selector: 'violation-info-modal',
  templateUrl: './validation-info-modal.component.html',
  styleUrls: ['./validation-info-modal.component.css']
})
export class ValidationInfoModalComponent implements OnInit {

  @Input() violation: Violation;

  @Output() closeEvent = new EventEmitter<any>();

  constructor() { }


  ngOnInit(): void {
  }

  close() {
    this.closeEvent.emit('close')
  }

}

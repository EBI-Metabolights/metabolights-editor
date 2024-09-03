import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Violation } from '../../interfaces/validation-report.interface';

@Component({
  selector: 'raw-violation-modal',
  templateUrl: './raw-violation-modal.component.html',
  styleUrls: ['./raw-violation-modal.component.css']
})
export class RawViolationModalComponent implements OnInit {

  @Input() violation: Violation;

  @Output() closeEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  render() {
    return JSON.stringify(this.violation)
  }

  close() {
    this.closeEvent.emit('close')
  }



}

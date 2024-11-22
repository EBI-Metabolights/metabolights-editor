import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Violation } from '../../interfaces/validation-report.interface';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'override-modal',
  templateUrl: './override-modal.component.html',
  styleUrl: './override-modal.component.css'
})
export class OverrideModalComponent implements OnInit {
  
  @Input() violation: Violation;

  @Output() closeEvent = new EventEmitter<any>();

  constructor() { }

  options: FormGroup; 


  ngOnInit(): void {
    this.options = inject(FormBuilder).group({
      type: [this.violation.type],
      curator: [""],
      enabled: [false],
      comments: [""]
    })
  }

  close() {
    this.closeEvent.emit('close')
  }
}

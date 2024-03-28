import { Component, Input, OnInit } from '@angular/core';
import { Violation } from '../interfaces/validation-report.interface';

@Component({
  selector: 'prototype-detail',
  templateUrl: './prototype-detail.component.html',
  styleUrls: ['./prototype-detail.component.css']
})
export class PrototypeDetailComponent implements OnInit {

  @Input() violation: Violation
  isRawModalOpen: boolean = false;
  isInfoModalOpen: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  openRawModal() {
    this.isRawModalOpen = true;
  }

  closeRawModal() {
    this.isRawModalOpen = false;
  }

  openInfoModal() {
    this.isInfoModalOpen = true;
  }

  closeInfoModal() {
    this.isInfoModalOpen = false;
  }

}

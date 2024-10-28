import { Component, inject, Input, OnInit } from '@angular/core';
import { Violation } from '../interfaces/validation-report.interface';
import { Store } from '@ngxs/store';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { filter, Observable } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';

@Component({
  selector: 'validation-v2-detail',
  templateUrl: './validation-detail.component.html',
  styleUrls: ['./validation-detail.component.css']
})
export class ValidationV2DetailComponent implements OnInit {

  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  runTime$: Observable<string> = inject(Store).select(ValidationState.lastValidationRunTime);

  @Input() violation: Violation
  isRawModalOpen: boolean = false;
  isInfoModalOpen: boolean = false;

  currentTaskId = "";
  runTime = "";

  typeIcon: string = "question"
  protected isCurator: boolean = false;

  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.isCurator$.subscribe((value) => this.isCurator = value);
    this.runTime$.pipe(filter(val => val !== null)).subscribe((time) => { this.runTime = time})
    this.typeIcon = this.getViolationTypeIcon();
  }

  getViolationTypeIcon(): string {
    if (this.violation.type === 'ERROR') return 'error'
    if (this.violation.type === 'WARNING') return 'warning'
    if (this.violation.type === 'INFO') return 'lightbulb_circle'
    if (this.violation.type === 'SUCCESS') return 'verified'
  }

  copyToClipboard(subject: string): void {
    this.clipboard.copy(subject);
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

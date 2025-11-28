import { Component, inject, Input, OnInit } from '@angular/core';
import { Breakdown, Violation } from '../interfaces/validation-report.interface';
import { Store } from '@ngxs/store';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { filter, Observable } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { OverrideModalComponent } from '../modals/override-modal/override-modal.component';

@Component({
  selector: 'validation-v2-detail',
  templateUrl: './validation-detail.component.html',
  styleUrls: ['./validation-detail.component.css'],
})
export class ValidationV2DetailComponent implements OnInit {

  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  runTime$: Observable<string> = inject(Store).select(ValidationState.lastValidationRunTime);
  breakdown$: Observable<Breakdown> = inject(Store).select(ValidationState.breakdown);

  @Input() violation: Violation
  @Input() overrides: any;
  @Input() studyId: any;

  isRawModalOpen: boolean = false;
  isInfoModalOpen: boolean = false;
  isOverrideModalOpen: boolean = false;

  currentTaskId = "";
  runTime = "";
  breakdown: Breakdown = null;

  typeIcon: string = "question"
  protected isCurator: boolean = false;

  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.isCurator$.subscribe((value) => this.isCurator = value);
    this.runTime$.pipe(filter(val => val !== null)).subscribe((time) => { this.runTime = time});
    this.breakdown$.pipe(filter(val => ![undefined, null].includes(val.errors) && ![undefined, null].includes(val.warnings)))
      .subscribe(val => this.breakdown = val);
    this.typeIcon = this.getViolationTypeIcon();
  }

  getViolationSource(violation): string {
    if (violation.sourceColumnHeader && violation.sourceColumnHeader.length > 0) {
      return  violation.sourceColumnHeader + " column in " +  violation.sourceFile
    }
    return violation.sourceFile
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

  handleOverride(violation: Violation) {
    this.isOverrideModalOpen = true;
  }

  closeOverrideModal() {
    this.isOverrideModalOpen = false;
  }

  getMailtoLink(): string {
    if (!this.violation || !this.violation.identifier) {
      return '';
    }
    return `mailto:metabolights-help@ebi.ac.uk?subject=Regarding validation rule - ${this.violation.identifier} of study ${this.studyId}`;
  }
}

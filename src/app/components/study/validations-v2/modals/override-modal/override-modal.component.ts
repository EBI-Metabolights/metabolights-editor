import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FullOverride, Violation } from '../../interfaces/validation-report.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { filter, Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { Owner } from 'src/app/ngxs-store/non-study/user/user.actions';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { MatDialog } from '@angular/material/dialog';
import { DeleteOverrideDialogComponent } from '../delete-override-dialog/delete-override-dialog.component';

@Component({
  selector: 'override-modal',
  templateUrl: './override-modal.component.html',
  styleUrls: ['./override-modal.component.css'], // Corrected `styleUrl` to `styleUrls`
})
export class OverrideModalComponent implements OnInit, OnChanges {
  
  @Input() violation!: Violation;

  @Output() closeEvent = new EventEmitter<any>();

  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  user$: Observable<Owner> = inject(Store).select(UserState.user);

  deleted = false;


  options!: FormGroup; // Ensure it is properly defined
  types = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARNING', viewValue: 'WARNING' },
    { value: 'ERROR', viewValue: 'ERROR' },
  ];
  studyId: string = null;
  user: Owner = null;
  override: FullOverride = null;

  constructor(private formBuilder: FormBuilder, private store: Store, private dialog: MatDialog) { } 

  ngOnInit(): void {
    this.initializeForm();
    this.studyId$.pipe(filter(val => val !== null)).subscribe((id) => this.studyId = id);
    this.user$.pipe(filter(val => val !== null)).subscribe((user) => this.user = user);
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['violation'] && changes['violation'].currentValue) {
      // Reinitialize form when violation input changes
      this.initializeForm();
      this.store.selectOnce(ValidationState.specificOverride(this.violation.identifier)).pipe(
        filter(val => val !== null)
      ).subscribe((override) => {
        this.override = override;
      });
    }
  }

  initializeForm(): void {
    this.options = this.formBuilder.group({
      type: [(this.violation.overrided ? this.violation.type : 'WARNING') || "WARNING"], // Use default if violation is undefined
      enabled: [this.violation?.overrided || true], // Default to false
      comments: [this.violation?.overrideComment || ""],
    });
  }

  close() {
    this.closeEvent.emit('close');
  }

  save() {
    let override = null;
    const formValues = this.options.value;
    override = {
      enabled: formValues.enabled,
      rule_id: this.violation.identifier,
      new_type: formValues.type,
      curator: this.user.email,
      comment: formValues.comments,
      source_file: "",
      source_column_header: "",
      source_column_index: ""
    }
    let actionClass = null;
    this.violation.overrided ? actionClass = ValidationReportV2.Override.Update : actionClass = ValidationReportV2.Override.Create;
    this.store.dispatch(new actionClass(this.studyId, override));
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteOverrideDialogComponent, {
      width: '400px'
    });

    const dialogInstance = dialogRef.componentInstance;
    dialogInstance.override = this.override;
    dialogRef.componentInstance.deleteConfirmed.subscribe(() => {
      this.store.dispatch(new ValidationReportV2.Override.Delete(this.studyId, this.override.override_id));
      //this.closeEvent.emit('deleted');
      this.deleted = true;
    })
    

    // TODO: have a toastr message popup somewhere
   }
  }

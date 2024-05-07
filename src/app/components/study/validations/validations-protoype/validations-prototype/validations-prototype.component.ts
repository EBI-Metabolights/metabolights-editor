import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppError } from 'src/app/services/error/app-error';
import { BadInput } from 'src/app/services/error/bad-input';
import { ForbiddenError } from 'src/app/services/error/forbidden-error';
import { InternalServerError } from 'src/app/services/error/internal-server-error';
import { MaintenanceError } from 'src/app/services/error/maintenance-error';
import { NotFoundError } from 'src/app/services/error/not-found-error';
import { PermissionError } from 'src/app/services/error/permission-error';
import { ValidationReportInterface, Violation } from '../interfaces/validation-report.interface';
import { Select, Store } from '@ngxs/store';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';



@Component({
  selector: 'validations-prototype',
  templateUrl: './validations-prototype.component.html',
  styleUrls: ['./validations-prototype.component.css']
})
export class ValidationsPrototypeComponent implements OnInit {

  @Select(ValidationState.newReport) newReport$: Observable<ValidationReportInterface>;
  @Select(ValidationState.newReportViolationsAll) allViolations$: Observable<Violation[]>;

  @Select(ValidationState.newReportViolations('input')) generalViolations$: Observable<Violation[]>;
  @Select(ValidationState.newReportViolations('investigation')) investigationViolations$: Observable<Violation[]>;
  @Select(ValidationState.newReportViolations('sample')) sampleViolations$: Observable<Violation[]>;
  @Select(ValidationState.newReportViolations('assay')) assayViolations$: Observable<Violation[]>;
  @Select(ValidationState.newReportViolations('assignment')) assignmentViolations$: Observable<Violation[]>;
  @Select(ValidationState.newReportViolations('files')) filesViolations$: Observable<Violation[]>;

  @Select(GeneralMetadataState.id) studyId$: Observable<string>;

  constructor(private store: Store) { }

  report: ValidationReportInterface = null;
  // report subsections
  allViolations: Violation[] = null;
  generalViolations: Violation[] = null;
  investigationViolations: Violation[] = null;
  sampleViolations: Violation[] =  null;
  assayViolations: Violation[] = null;
  assignmentViolations: Violation[] = null;
  filesViolations: Violation[] = null;

  studyId: string =  null

  checked: boolean = false;
  ready: boolean = false;

  ngOnInit(): void {

    this.newReport$.subscribe(value => {
      console.log(value === null)
      this.report = value;
      if (this.report !== null) {
        this.ready = true;
      }
    });

    this.allViolations$.subscribe((value) => {
      this.allViolations = value;
    });

    this.generalViolations$.subscribe((value) => {
      this.generalViolations = value;
    })

    this.investigationViolations$.subscribe((value) => {
      this.investigationViolations = value;
    });

    this.sampleViolations$.subscribe((value) => {
      this.sampleViolations = value;
    });

    this.assayViolations$.subscribe((value) => {
      this.assayViolations = value;
    });

    this.assignmentViolations$.subscribe((value) => {
      this.assignmentViolations = value;
    });

    this.filesViolations$.subscribe((value) => {
      this.filesViolations = value;
    });



    this.studyId$.subscribe(value => {
      this.studyId = value;
    });
  }


  public handleError(error: Response) {
    if (error.status === 400 || error.status === 417 || error.status === 412) {
      return throwError(new BadInput(error));
    }
    if (error.status === 401) {
      return throwError(new PermissionError(error));
    }
    if (error.status === 403) {
      return throwError(new ForbiddenError(error));
    }

    if (error.status === 404 || error.status === 0) {
      return throwError(new NotFoundError(error));
    }

    if (error.status === 500) {
      return throwError(new InternalServerError(error));
    }

    if (error.status === 503) {
      return throwError(new MaintenanceError(error));
    }

    return throwError(new AppError(error));
  }

}

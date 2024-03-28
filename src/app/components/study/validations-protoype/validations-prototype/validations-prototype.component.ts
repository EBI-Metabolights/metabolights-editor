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
import { ValidationReport } from '../interfaces/validation-report.interface';

@Component({
  selector: 'validations-prototype',
  templateUrl: './validations-prototype.component.html',
  styleUrls: ['./validations-prototype.component.css']
})
export class ValidationsPrototypeComponent implements OnInit {

  constructor(private http: HttpClient) { }

  report: ValidationReport = null

  checked: boolean = false

  ngOnInit(): void {
    this.getValidationReport().subscribe(
      (response) => {
        this.report = response
      }
    )
  }

  getValidationReport(): Observable<ValidationReport> {
    return this.http.get<ValidationReport>("assets/validation-report-v2.json").pipe(
      map((res) => res),
      catchError(this.handleError)
    );
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

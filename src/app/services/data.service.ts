import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { Http } from '@angular/http';
import { IAppState } from './../store';
import { Router } from '@angular/router';
import { AppError } from './error/app-error';
import { BadInput } from './error/bad-input';
import { NgRedux } from '@angular-redux/store';
import { catchError, map, tap } from 'rxjs/operators';
import { NotFoundError } from './error/not-found-error';
import { ForbiddenError } from './error/forbidden-error';
import { InternalServerError } from './error/internal-server-error';

export class DataService {
  constructor(public url: any, public http: Http) { }

  public handleError(error: Response) {
    if (error.status === 400)
      return throwError(new BadInput(error));

    if (error.status === 403)
      return throwError(new ForbiddenError(error));

    if (error.status === 404 || error.status === 0)
      return throwError(new NotFoundError(error));

    if (error.status === 500){
      return throwError(new InternalServerError(error));
    }
    
    return throwError(new AppError(error));
  }
}

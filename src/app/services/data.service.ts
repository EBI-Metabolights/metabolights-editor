import { throwError } from "rxjs";
import { AppError } from "./error/app-error";
import { BadInput } from "./error/bad-input";
import { NotFoundError } from "./error/not-found-error";
import { ForbiddenError } from "./error/forbidden-error";
import { InternalServerError } from "./error/internal-server-error";
import { HttpClient } from "@angular/common/http";
import { MaintenanceError } from "./error/maintenance-error";
import { PermissionError } from "./error/permission-error";

export class DataService {
  constructor(public url: any, public http: HttpClient) {}

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

  public convertSnakeCaseToCamelCase(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.convertSnakeCaseToCamelCase(item));
    } else if (data !== null && data.constructor === Object) {
      return Object.keys(data).reduce((accumulator, currentKey) => {
        const camelCaseKey = currentKey.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
        accumulator[camelCaseKey] = this.convertSnakeCaseToCamelCase(data[currentKey]);
        return accumulator;
      }, {});
    }
    return data;
  }
}

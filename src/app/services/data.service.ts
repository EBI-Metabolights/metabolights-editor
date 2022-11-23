import { throwError } from "rxjs";
import { AppError } from "./error/app-error";
import { BadInput } from "./error/bad-input";
import { NotFoundError } from "./error/not-found-error";
import { ForbiddenError } from "./error/forbidden-error";
import { InternalServerError } from "./error/internal-server-error";
import { HttpClient } from "@angular/common/http";

export class DataService {
  constructor(public url: any, public http: HttpClient) {}

  public handleError(error: Response) {
    if (error.status === 400) {
      return throwError(new BadInput(error));
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

    return throwError(new AppError(error));
  }
}

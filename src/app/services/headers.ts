import { HttpHeaders } from "@angular/common/http";
/* eslint-disable @typescript-eslint/naming-convention */
export const httpOptions = {
  headers: new HttpHeaders({
    //'Content-Type':  'application/json',
    Accept: "application/json",
    user_token: "dummy",
  }),
};

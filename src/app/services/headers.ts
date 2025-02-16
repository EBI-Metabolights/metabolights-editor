import { HttpHeaders } from "@angular/common/http";
/* eslint-disable @typescript-eslint/naming-convention */
export const httpOptions = {
  headers: new HttpHeaders({
    //'Content-Type':  'application/json',
    Accept: "application/json",
    user_token: "dummy",
    Authorization: "Bearer dummy"
  }),
};

export interface MtblsJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  role?: string;
}

export interface MetabolightsUser {
  apiToken: string;
  role: string;
  email: string;
  status: string;
}

export interface StudyPermission {
  userName: string;
  userRole: string;
  partner: boolean;
  submitterOfStudy: boolean;
  obfuscationCode: string;
  studyId: string;
  studyStatus: string;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

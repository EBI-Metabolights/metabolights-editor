import { HttpHeaders } from "@angular/common/http";
/* eslint-disable @typescript-eslint/naming-convention */
export const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json",
  })
};

export interface MtblsJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  role?: string;
  email: string;
}

export interface MetabolightsUser {
  apiToken: string;
  role: number;
  email: string;
  status: string;
}

enum Resource {
  Submission = "submission",
  ValidationReports = "validation-reports",
  ValidationOverrides = "validation-overrides",
  MetadataFiles = "metadata-files",
  DataFiles = "data-files",
  DataFilesIndex = "data-files-index",
  DbMetadata = "db-metadata",
  StudyPublication = "study-publication",
  StudyRevisionDate = "study-revision-date",
  AuditFiles = "audit-files",
  InternalFiles = "internal-files",
  StudyIndex = "study-index"
}

enum Scope {
  Read = "read",
  Update = "update",
  Delete = "delete",
  List = "list",
  Create = "create",
  Download = "download",
  Upload = "upload",
}

enum DbScope {
  MakePrivate = "make-private",
  MakeProvisional = "make-provisional",
  CreateRevision = "create-revision",
  UpdateLicense = "update-license"
}

type AnyScope = Scope | DbScope;
type ResourceScopeMap = {
  [key in Resource]?: AnyScope[];
};

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
  reason: string;
  scopes: ResourceScopeMap
}

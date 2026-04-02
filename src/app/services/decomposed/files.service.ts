import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStudyFiles } from 'src/app/models/mtbl/mtbls/interfaces/study-files.interface';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { catchError, map } from 'rxjs/operators';
import { httpOptions } from '../headers';
import { ConfigurationService } from 'src/app/configuration.service';
import { Store } from '@ngxs/store';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { AuthService } from '../auth.service';


@Injectable({
  providedIn: 'root'
})
export class FilesService extends BaseConfigDependentService {

  id: string;

  constructor(
    public http: HttpClient,
    configService: ConfigurationService,
    private authService: AuthService,
    public store: Store) {
    super(http, configService, store);
  }

  getStudyFilesFetch(force, readonly: boolean = true, suppliedId: string): Observable<IStudyFiles> {

    if (suppliedId === undefined) {
      console.trace();
    }
    if (force) {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL +
          "/studies" +
          "/" +
          suppliedId +
          "/files-fetch?force=true&readonlyMode=" + readonly,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    } else {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL + "/studies" + "/" + suppliedId + "/files-fetch",
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }

  /**
 * This is the same as the method above, except includes a few new parameters for directory listing.
 *
 * @param id MTBLS ID of the study.
 * @param include_sub_dir Include subdirectories in the study directory listing output
 * @param dir If supplied will only list the contents of that directory (if it exists)
 * @param parent Parent directory for the above parameter
 * @returns observable of a wrapper containing the studies file information.
 */
  getStudyFilesListFromLocation(id, include_sub_dir, dir, parent, location: 'study'): Observable<IStudyFiles> {
    const studyId = id
    const includeSubDir = include_sub_dir ? include_sub_dir : null;
    const directory = dir ? dir : null;
    let query = this.url.baseURL + "/studies" + "/" + studyId + "/files/tree?";
    if (includeSubDir) {
      query = query + "include_sub_dir=" + includeSubDir;
    } else {
      query = query + "include_sub_dir=false";
    }
    if (directory) {
      if (parent) {
        query = query + "&directory=" + parent + directory.file;
      } else {
        query = query + "&directory=" + directory.file;
      }
    }
    if (location) {
      query = query + "&location=" + location;
    }
    return this.http
      .get<IStudyFiles>(query, httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteProperties(data) {
    delete data.obfuscationCode;
    delete data.uploadPath;
    return data;
  }

  uploadFile(studyId: string, file: File, directory: string = ''): Observable<{ progress: number; success?: boolean; error?: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    let uploadUrl = `${this.url.baseURL}/studies/${studyId}/drag-drop-upload`;
    if (directory) {
      uploadUrl += `?directory=${encodeURIComponent(directory)}`;
    }
    return this.http.post(uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              return { progress: Math.round((event.loaded / event.total) * 100) };
            }
            return { progress: 0 };
          case HttpEventType.Response:
            return { progress: 100, success: true };
          default:
            return { progress: 0 };
        }
      })
    );
  }

  createAuditFolder(studyId: string): Observable<any> {
    const auditUrl = `${this.url.baseURL}/studies/${studyId}/audit`;
    return this.http
      .post(
        auditUrl,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getGlobusPermissions(studyId: string): Observable<any> {
    const globusUrl = this.url.baseURL + `/studies/${studyId}/globus-permission`;
    return this.http.get(globusUrl, this.getGlobusHttpOptions()).pipe(catchError(this.handleError));
  }

  enableGlobusPermissions(studyId: string): Observable<any> {
    const globusUrl = this.url.baseURL + `/studies/${studyId}/globus-permission?access-type=read-write`;
    return this.http.put(globusUrl, {}, this.getGlobusHttpOptions()).pipe(catchError(this.handleError));
  }

  disableGlobusPermissions(studyId: string): Observable<any> {
    const globusUrl = this.url.baseURL + `/studies/${studyId}/globus-permission`;
    return this.http.delete(globusUrl, this.getGlobusHttpOptions()).pipe(catchError(this.handleError));
  }

  verifyGlobusUsername(username: string): Observable<any> {
    const globusUrl = this.url.baseURL + `/globus/identities?username=${username}`;
    return this.http.get(globusUrl, this.getGlobusHttpOptions()).pipe(catchError(this.handleError));
  }

  private getGlobusHttpOptions() {
    let token = this.authService.getApiToken();
    if (!token || token === '') {
      const user = this.store.selectSnapshot(UserState.user);
      token = user?.apiToken;
    }
    return {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'User-Token': token ?? ''
      })
    };
  }

}

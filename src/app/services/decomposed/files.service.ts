import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStudyFiles } from 'src/app/models/mtbl/mtbls/interfaces/study-files.interface';
import { DataService } from '../data.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { catchError } from 'rxjs/operators';
import { httpOptions } from '../headers';
import { ConfigurationService } from 'src/app/configuration.service';
import { Select, Store } from '@ngxs/store';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata.state';

@Injectable({
  providedIn: 'root'
})
export class FilesService extends BaseConfigDependentService {

  @Select(GeneralMetadataState.id) private studyIdentifier$: Observable<string>

  id: string;

  constructor(
    public http: HttpClient, 
    configService: ConfigurationService,
    public store: Store) {
    super(http, configService);
    this.studyIdentifier$.subscribe((id) => {
      if (id !== null) this.id = id
    });
   }

  getStudyFilesFetch(force, readonly: boolean = true): Observable<IStudyFiles> {
    const studyId = this.id;
    if (force) {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL +
            "/studies" +
            "/" +
            studyId +
            "/files-fetch?force=true&readonlyMode=" + readonly,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    } else {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL + "/studies" + "/" + studyId + "/files-fetch",
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
      const studyId = id ? id : this.id;
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

}

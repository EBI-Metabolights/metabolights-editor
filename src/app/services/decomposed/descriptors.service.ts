import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { Observable } from 'rxjs';
import { IStudyDesignDescriptorWrapper } from 'src/app/models/mtbl/mtbls/interfaces/study-design-descriptor-wrapper.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DescriptorsService extends BaseConfigDependentService{

  constructor(http: HttpClient, configService: ConfigurationService) {super(http, configService)}

    /**
   * Get the study design descriptors for a study.
   *
   * @returns An object or list of objects representing study design descriptors, via the Observable.
   */
    getDesignDescriptors(id): Observable<IStudyDesignDescriptorWrapper> {
      return this.http
        .get<IStudyDesignDescriptorWrapper>(
          this.url.baseURL + "/studies" + "/" + id + "/descriptors",
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  
    /**
     * Post a new design descriptor for a study.
     *
     * @param body The new design descriptor.
     * @returns An object representing a study design descriptor, via the Observable.
     */
    saveDesignDescriptor(body, id): Observable<IStudyDesignDescriptorWrapper> {
      return this.http
        .post<IStudyDesignDescriptorWrapper>(
          this.url.baseURL + "/studies" + "/" + id + "/descriptors",
          body,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

      /**
   * Update an exisiting design descriptor for a study.
   *
   * @param annotationValue The annotation value, which identifies the design descriptor to update.
   * @param body - The updated design descriptor.
   * @returns An object representing a study design descriptor, via the Observable.
   */
  updateDesignDescriptor(
    annotationValue,
    body,
    id
  ): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .put<IStudyDesignDescriptorWrapper>(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/descriptors?term=" +
          annotationValue,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a studies design descriptor.
   *
   * @param annotationValue The annotation value, which identifies the design descriptor to delete
   * @returns An object representing the now deleted study design descriptor, via the Observable.
   */
  deleteDesignDescriptor(
    annotationValue, id
  ): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .delete<IStudyDesignDescriptorWrapper>(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/descriptors?term=" +
          annotationValue,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

}

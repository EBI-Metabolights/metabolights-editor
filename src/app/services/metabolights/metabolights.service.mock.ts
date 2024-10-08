import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { httpOptions } from "../headers";
import { Observable } from "rxjs-compat";
import { IStudyDetailWrapper } from "src/app/models/mtbl/mtbls/interfaces/study-detail.interface";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { inject } from "@angular/core";
import { Store } from "@ngxs/store";

export class MockMetabolightsService {
  private studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  id: string;
  http: HttpClient;

  getStudyFilesFetch(bool: true, d: true) {
    const obj = {
      study: [],
      latest: "latest",
    };

    return of({
      obj,
    });
  }

  /**
   * Return a static list of IStudyDetail objects via an Observable
   * @returns Observable of IstudyDetail objects.
   */
  getAllStudies(): Observable<IStudyDetailWrapper> {

    const studies = [
      {
        "accession": "MTBLS9058",
        "createdDate": "2023-11-28",
        "description": "I don't see why i should have to type this again, kinda blows if you ask me, I'm a busy man, I've got a motorcycle, I'm the guy who tells people what theyre doing and where they do it at, I got a motorcycle and a sleeping bag, I aint ever wanted to work for nobody elses money",
        "releaseDate": "2024-11-27",
        "status": "Submitted",
        "curationRequest": "MANUAL_CURATION",
        "title": "Untargeted Metabolomic Analysis of primary age schoolchildren reveals Malus domestica consumption greatly increases passive resistance to onset of invasive doctorum",
        "updated": "20240124121007"
        },
        {
          "accession": "MTBLS8578",
          "createdDate": "2023-09-11",
          "description": "Please update the study abstract/description",
          "releaseDate": "2024-09-10",
          "status": "Submitted",
          "curationRequest": "MANUAL_CURATION",
          "title": "Please update the study title",
          "updated": "20231002233501"
          }
    ]
    return of({data: studies})
  }



  getDownloadLink(name, code) {
    return of("download.link");
  }

  getTitle(id) {
    return this.http.get(
      "https://www.ebi.ac.uk/metabolights/ws/studies/title",
      httpOptions
    );
  }
}

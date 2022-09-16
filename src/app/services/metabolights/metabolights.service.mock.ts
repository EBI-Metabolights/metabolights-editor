import { select } from "@angular-redux/store";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { of } from "rxjs";
import { httpOptions } from "../headers";

export class MockMetabolightsService {
    @select(state => state.study.identifier) studyIdentifier;
    id: string;
    http: HttpClient;

    getStudyFilesFetch(bool: true) {
        let obj = { 
            study: [],
            latest: 'latest'
        }

        return of({
            obj
        })
    }

    getDownloadLink(name, code) {
        return of('download.link')
    }

    getTitle(id) {
        return this.http.get("https://www.ebi.ac.uk/metabolights/ws/studies/title", httpOptions)
    }
}
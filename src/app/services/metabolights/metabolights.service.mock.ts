import { select } from "@angular-redux/store";
import { of } from "rxjs";

export class MockMetabolightsService {
    @select(state => state.study.identifier) studyIdentifier;
    id: string;

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
}
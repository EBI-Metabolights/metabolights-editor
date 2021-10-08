import { select } from "@angular-redux/store";
import { of } from "rxjs";

export class MockMetabolightsService {
    @select(state => state.study.identifier) studyIdentifier;
    id: string;

    getStudyFilesFetch(bool: true) {
        return of({
            study: {
                type: 'raw'
            }
        })
    }
}
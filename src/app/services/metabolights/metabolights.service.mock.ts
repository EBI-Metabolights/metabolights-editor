import { select } from "@angular-redux/store";

export class MockMetabolightsService {
    @select(state => state.study.identifier) studyIdentifier;
    id: string;
}
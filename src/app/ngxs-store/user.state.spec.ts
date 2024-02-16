import { TestBed } from "@angular/core/testing";
import { NgxsModule, Store } from "@ngxs/store";
import { UserState } from "./user.state";
import { MetabolightsService } from "../services/metabolights/metabolights.service";
import { MockMetabolightsService } from "../services/metabolights/metabolights.service.mock";
import { User } from "./user.actions";


fdescribe('User', () => {
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([UserState])],
            providers: [{provide: MetabolightsService, useClass: MockMetabolightsService}]
        });
        store = TestBed.inject(Store);
    });

    it('gets a list of user studies, and dispatches a follow up action to persist those studies', () => {
        store.dispatch(new User.Studies.Get);

        const studies = store.selectSnapshot(state => state.user.userStudies)
        expect(studies.length).toBe(1);
    })


})
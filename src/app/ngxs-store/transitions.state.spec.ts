import { TestBed } from "@angular/core/testing";
import { NgxsModule, Store } from "@ngxs/store";
import { TransitionsState } from "./transitions.state";
import { Loading, SetLoadingInfo, SetTabIndex } from "./transitions.actions";

describe('Transitions', () => {
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([TransitionsState])],
            providers: []
        });
        store = TestBed.inject(Store);
    });

    it('should set the loading information', () => {
        const msg = 'imminent apocalypse level angular build disaster'
        store.dispatch(new SetLoadingInfo(msg));
        const loadingMessage = store.selectSnapshot(state => state.transitions.loadingInformation);
        expect(loadingMessage).toBe('imminent apocalypse level angular build disaster')
    });

    it('should set the tab index', () => {
        const index = "0"
        store.dispatch(new SetTabIndex(index));
        const stateTabIndex = store.selectSnapshot(state => state.transitions.currentTabIndex);
        expect(stateTabIndex).toBe("0");
    });

    it('should toggle the loading state', () => {
        store.dispatch(new Loading.Toggle());
        const loadingState = store.selectSnapshot(state => state.transitions.loading);
        expect(loadingState).toBeFalsy();
    });

    it('should enable the loading state', () => {
        store.dispatch(new Loading.Enable());
        const loadingState = store.selectSnapshot(state => state.transitions.loading);
        expect(loadingState).toBeTruthy();
    });

    it('should disable the loading state', () => {
        store.dispatch(new Loading.Disable());
        const loadingState = store.selectSnapshot(state => state.transitions.loading);
        expect(loadingState).toBeFalsy();
    })

})
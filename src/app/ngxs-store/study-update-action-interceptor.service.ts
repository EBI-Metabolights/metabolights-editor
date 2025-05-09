import { Injectable, Injector } from '@angular/core';
import { NgxsNextPluginFn, NgxsPlugin, setValue, Store } from '@ngxs/store';
import { Assay } from './study/assay/assay.actions';
import { Descriptors, Factors } from './study/descriptors/descriptors.action';
import { People, Publications, StudyAbstract, StudyReleaseDate, Title } from './study/general-metadata/general-metadata.actions';
import { MAF } from './study/maf/maf.actions';
import { Protocols } from './study/protocols/protocols.actions';
import { Samples } from './study/samples/samples.actions';
import { SetValidationRunNeeded } from './study/validation/validation.actions';
import { IntermittentRefreshActionStack } from './non-study/transitions/transitions.actions';
import { ApplicationState } from './non-study/application/application.state';
import { GeneralMetadataState } from './study/general-metadata/general-metadata.state';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoggingMiddleware implements NgxsPlugin {
    private store!: Store;
    private namespaces = [
        Assay,
        Descriptors,
        Factors,
        Title,
        StudyAbstract,
        StudyReleaseDate,
        Publications,
        People,
        MAF,
        Protocols,
        Samples
    ]
    private intermittentRefreshNeededNamespaces = [
        Protocols, 
        Samples
    ]
    private actionStack: string[] = [];
    private postReponseActionVerbs = ['Set', 'Organise']

    constructor(private injector: Injector) { }

    /**
     * NgxsPlugin main method implementation. Listen out for certain actions, and if a matching action is found,
     * dispatch a side effect action setting a flag, which is intended to prompt users to rerun validation.
     * Secondary function is to listen for certain actions that intermittently don't resolve, and if such an action is handled,
     * push it to a stack that is consumed by components that will use it to decide whether to render a message prompting the user
     * to manually refresh the page.
     * @param state Current NGXS state 
     * @param action Intercepted action
     * @param next NgxsNextPluginFn
     * @returns action
     */
    handle(state: any, action: any, next: NgxsNextPluginFn): any {
        if (!this.store) this.store = this.injector.get(Store);
        const actionName = action.constructor.type;
        const isInNamespace = this.namespaces.some(namespace => {
            const actionClasses = Object.values(namespace);
            return actionClasses.some(actionClass => action instanceof actionClass);
        });
        const isInIRNNamespace = this.intermittentRefreshNeededNamespaces.some(ns => {
            const actionClasses = Object.values(ns);
            return actionClasses.some(actionClass => action instanceof actionClass);
        });

        if (isInNamespace && !['Get', 'Set', 'Organise'].some(substr => actionName.includes(substr))) {
           this.store.dispatch(new SetValidationRunNeeded(true));
        }
        if (isInIRNNamespace) {
            this.isIntermittentRefreshAction(action) ? this.store.dispatch(new IntermittentRefreshActionStack.Sync(this.actionStack)) : null
            this.isIntermittentRefreshActionResolution(action) ? this.store.dispatch(new IntermittentRefreshActionStack.Sync(this.actionStack)) : null    
        }
        if (this.isOtherStudyAssayAction(action)) { // if we have a polluted state and we have an assay file from another study, do not have the action proceed to its handler.
            return of(state)
        }

        return next(state, action);
    }

    
    isIntermittentRefreshAction(action: any): boolean {
        const actionName = action.constructor.type;
        if (!['Get', 'Set', 'Organise'].some(substr => actionName.includes(substr))) {
            this.actionStack.push(actionName)
            return true;
        }
        return false;
    }

    isIntermittentRefreshActionResolution(action: any): boolean {
        const actionName = action.constructor.type;
        if (this.postReponseActionVerbs.some(substr => actionName.includes(substr))) {
            const nsRegex = /\[[A-Za-z]+\]/;
            const ns = actionName.match(nsRegex);
            let ind = this.actionStack.findIndex(action => action.includes(ns));
            if (ind > -1) {
                this.actionStack.splice(ind, 1);
                return true;
            }
        }
        return false;
    }

    isOtherStudyAssayAction(action: any): boolean {
        const actionName = action.constructor.type;
        if (actionName.includes('Set Study Assay')) {
            const currentStudyId = this.store.selectSnapshot<string>(GeneralMetadataState.id);
            if (!action.assay.data.file.includes(currentStudyId)) {
                console.debug(`Discarded! ${action.assay.data.file}`)
                return true
            }
        }
        return false;
    }

}
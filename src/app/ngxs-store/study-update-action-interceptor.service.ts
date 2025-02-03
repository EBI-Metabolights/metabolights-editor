import { Injectable, Injector } from '@angular/core';
import { NgxsNextPluginFn, NgxsPlugin, setValue, Store } from '@ngxs/store';
import { Assay } from './study/assay/assay.actions';
import { Descriptors, Factors } from './study/descriptors/descriptors.action';
import { People, Publications, StudyAbstract, StudyReleaseDate, Title } from './study/general-metadata/general-metadata.actions';
import { MAF } from './study/maf/maf.actions';
import { Protocols } from './study/protocols/protocols.actions';
import { Samples } from './study/samples/samples.actions';
import { SetValidationRunNeeded } from './study/validation/validation.actions';

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
    constructor(private injector: Injector) { }

    handle(state: any, action: any, next: NgxsNextPluginFn): any {
        if (!this.store) this.store = this.injector.get(Store);
        const actionName = action.constructor.type;
        const isInNamespace = this.namespaces.some(namespace => {
            const actionClasses = Object.values(namespace);
            return actionClasses.some(actionClass => action instanceof actionClass);
        });

        if (isInNamespace && !['Get', 'Set', 'Organise'].some(substr => actionName.includes(substr))) {
           this.store.dispatch(new SetValidationRunNeeded(true));
        }

        return next(state, action);
    }
}
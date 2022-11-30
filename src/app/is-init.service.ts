import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { IsInitialised } from "./components/store";
import { selectIsInitialised } from "./state/meta-settings.selector";


@Injectable({
    providedIn: "root",
  })
export class IsInitService {
    private isInit: IsInitialised = {
        ready: false,
        time: ""
    }

    constructor(private store: Store) {

    }

    getIsInit() {
        return this.isInit;
    }

    setIsInit() {
        this.isInit = {
            ready: true,
            time: new Date()
        }
    }

    reset() {
        this.isInit = {
            ready: false,
            time: ""
        }
    }



}
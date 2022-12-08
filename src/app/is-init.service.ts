import { Injectable } from "@angular/core";
import { IsInitialised } from "./components/store";


@Injectable({
    providedIn: "root",
  })
export class IsInitService {
    private isInit: IsInitialised = {
        ready: false,
        time: ""
    }

    constructor() {

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
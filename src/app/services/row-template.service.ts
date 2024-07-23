import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigurationService } from "../configuration.service";
import { Observable, of } from "rxjs";
import { PlatformLocation } from "@angular/common";

export type AssayTemplateRow = "GC-MS" | "LC-MS" | "NMR" | "DI-MS"

@Injectable({
    providedIn: 'root'
})
export class RowTemplateService {
    public baseHref: string;
    public templatePath: string;
    private insertionCounter: number = 0;
    private assaySheetsWithTemplateRowsPrepared: Array<string> = [];


    constructor(private http: HttpClient, private configService: ConfigurationService, private platformLocation: PlatformLocation) {
     this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      this.templatePath = this.baseHref + "assets/templateRows/";
    }

    getTemplateRow(assayFilename: string): Observable<Record<string, any>> {
        const type = this.getTemplateByAssayFilename(assayFilename);
        if (type === null) return of(null)
        const templateSubPath = `a_MTBLS_${this.getTemplateByAssayFilename(assayFilename)}_TEMPLATE_metabolite_profiling.json`
        return this.http.get(`${this.templatePath}${templateSubPath}`)
    }

    getTemplateByAssayFilename(filename: string): AssayTemplateRow {
        if (filename.indexOf("NMR") > -1) return "NMR"
        if (filename.indexOf("LC-MS") > -1) return "LC-MS"
        if (filename.indexOf("GC-MS") > -1) return "GC-MS"
        if (filename.indexOf("DI-MS") > -1) return "DI-MS"
        return null
    }

    incrementTemplateInsertionCounter(): void {
        this.insertionCounter += 1;
    }

    markAsPrepared(assay: string): void {
        this.assaySheetsWithTemplateRowsPrepared.push(assay);
    }

    get templateCounter() {
        return this.insertionCounter;
    }

    get preparedAssays() {
        return this.assaySheetsWithTemplateRowsPrepared;
    }

    
}
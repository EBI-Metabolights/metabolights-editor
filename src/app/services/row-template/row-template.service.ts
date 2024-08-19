import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { PlatformLocation } from "@angular/common";
import { ConfigurationService } from "src/app/configuration.service";

export type AssayTemplateRow = "GC-MS" | "LC-MS" | "NMR" | "DI-MS"

@Injectable({
    providedIn: 'root'
})
export class RowTemplateService {
    public baseHref: string;
    public templatePath: string;
    public protocolGuidePath: string;
    private insertionCounter: number = 0;
    private assaySheetsWithTemplateRowsPrepared: Array<string> = [];
    private assaySheetsRecentlyEdited: Array<string> = [];


    constructor(private http: HttpClient, private configService: ConfigurationService, private platformLocation: PlatformLocation) {
     this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      this.templatePath = this.baseHref + "assets/templateRows/";
      this.protocolGuidePath = `${this.baseHref}assets/protocolGuides/protocolGuides.json`
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

    getProtocolGuides(): Observable<Record<string,any>> {
      return this.http.get(this.protocolGuidePath)
    }

    incrementTemplateInsertionCounter(): void {
        this.insertionCounter += 1;
    }

    markAsPrepared(assay: string): void {
        this.assaySheetsWithTemplateRowsPrepared.push(assay);
    }

    markAsRecentlyEdited(assay: string): void {
        this.assaySheetsRecentlyEdited.push(assay)
    }

    removeAsRecentlyEdited(assay: string): void {
        let index;
        while ((index = this.assaySheetsRecentlyEdited.indexOf(assay)) !== -1) {
            this.assaySheetsRecentlyEdited.splice(index, 1);
        }
    }

    get templateCounter() {
        return this.insertionCounter;
    }

    get preparedAssays() {
        return this.assaySheetsWithTemplateRowsPrepared;
    }

    get recentlyEdited() {
        return this.assaySheetsRecentlyEdited;
    }

    
}
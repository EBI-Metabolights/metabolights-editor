import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/configuration.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { TableService } from './table.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { IAssay } from 'src/app/models/mtbl/mtbls/interfaces/assay.interface';
import { ApplicationState } from 'src/app/ngxs-store/non-study/application/application.state';

type AssayTemplateConfigMap = Record<string, { label?: string }>;

const ASSAY_SUB_TECHNIQUE_LABELS: Record<string, string> = {
  'LC-MS': 'LC',
  'LC-DAD': 'Diode array detection (LC-DAD)',
  'GC-MS': 'GC',
  'GCxGC-MS': '2D GC (GCxGC)',
  'GC-FID': 'Flame ionisation detector (GC-FID)',
  'DI-MS': 'Direct infusion (DI)',
  'FIA-MS': 'Flow injection analysis (FIA)',
  'CE-MS': 'Capillary electrophoresis (CE)',
  'MALDI-MS': 'Matrix-Assisted Laser Desorption-Ionisation mass spectrometry (MALDI-MS)',
  'MSImaging': 'MS Imaging',
  'MRImaging': 'Magnetic resonance imaging',
  'MS': 'Mass spectrometry',
  'NMR': 'Nuclear magnetic resonance',
};

@Injectable({
  providedIn: 'root'
})
export class AssaysService extends BaseConfigDependentService {

  public loadingMessage: string = "Loading assays information."

  constructor(
    http: HttpClient, configService: ConfigurationService, store: Store, private tableService: TableService) {  
      super(http, configService, store);
  }

  getAssaySheet(filename, suppliedId: string): Observable<ITableWrapper> {
    return this.tableService.getTable(filename, suppliedId);
  }

  deleteAssay(name, suppliedId: string): Observable<Object> {
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + suppliedId + "/assays/" + name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  extractAssayDetails(assay, suppliedId: string): Record<string, any> {
    const matchedTemplate = this.resolveAssayTemplate(assay?.name, suppliedId);
    if (!matchedTemplate) {
      return this.emptyAssayDetails();
    }

    const assayTemplates = this.getAvailableAssayTemplates();
    const templateConfig = assayTemplates[matchedTemplate];
    const classification = this.classifyAssayTemplate(matchedTemplate);

    return {
      assaySubTechnique: {
        name: ASSAY_SUB_TECHNIQUE_LABELS[matchedTemplate] || templateConfig?.label || matchedTemplate,
        template: matchedTemplate
      },
      assayTechnique: {
        name: classification.technique
      },
      assayMainTechnique: {
        name: classification.main
      },
      template: matchedTemplate
    };
  }

  addAssay(body: any, suppliedId: string): Observable<IAssay> {
    return this.http
    .post<IAssay>(
      this.url.baseURL + "/studies" + "/" + suppliedId + "/assays",
      body,
      httpOptions
    )
    .pipe(catchError(this.handleError));
  }

  addColumnToAssaySheet(filename: string, body: Record<string, any>, id: string): Observable<any> {
    return this.tableService.addColumns(filename, body, id);
  }

  addRows(filename: string, body: Record<string, any>, suppliedId: string): Observable<any> {
    return this.tableService.addRows(filename, body, suppliedId);
  }

  deleteRows(filename: string, rowIds: any, suppliedId: string): Observable<any> {
    return this.tableService.deleteRows(filename, rowIds, suppliedId);
  }

  updateCells(filename, body, suppliedId): Observable<any> {
    return this.tableService.updateCells(filename, body, suppliedId);

  }

  private emptyAssayDetails(): Record<string, any> {
    return {
      assaySubTechnique: { name: null, template: null },
      assayTechnique: { name: null },
      assayMainTechnique: { name: null },
      template: null
    };
  }

  private getAvailableAssayTemplates(): AssayTemplateConfigMap {
    const templateConfiguration = this.store.selectSnapshot(ApplicationState.templateConfiguration) as any;
    const versions = templateConfiguration?.versions || {};
    const templates: AssayTemplateConfigMap = {};

    Object.values(versions).forEach((versionConfig: any) => {
      Object.entries(versionConfig?.activeAssayFileTemplates || {}).forEach(([templateName, templateConfig]) => {
        if (!templates[templateName]) {
          templates[templateName] = templateConfig as { label?: string };
        }
      });
    });

    return templates;
  }

  private resolveAssayTemplate(filename: string, suppliedId: string): string | null {
    if (!filename || !suppliedId || !filename.split(suppliedId)[1]) {
      return null;
    }

    const assayInfo = filename.split(suppliedId)[1].split("_");
    const availableTemplates = this.getAvailableAssayTemplates();
    const knownTemplates = [
      ...Object.keys(availableTemplates),
      ...Object.keys(ASSAY_SUB_TECHNIQUE_LABELS)
    ];
    const normalizedTemplateMap = new Map<string, string>();

    knownTemplates.forEach((templateName) => {
      normalizedTemplateMap.set(this.normalizeTemplateName(templateName), templateName);
    });

    for (const candidate of [assayInfo[1], assayInfo[2]]) {
      if (!candidate) {
        continue;
      }

      const matchedTemplate = normalizedTemplateMap.get(this.normalizeTemplateName(candidate));
      if (matchedTemplate) {
        return matchedTemplate;
      }
    }

    return null;
  }

  private normalizeTemplateName(templateName: string): string {
    return (templateName || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  }

  private classifyAssayTemplate(templateName: string): { main: string; technique: string | null } {
    if (templateName === 'NMR' || templateName === 'MRImaging') {
      return {
        main: 'Nuclear magnetic resonance',
        technique: 'NMR'
      };
    }

    if (templateName.startsWith('LC-')) {
      return {
        main: 'Mass spectrometry',
        technique: 'LCMS'
      };
    }

    if (templateName.startsWith('GC')) {
      return {
        main: 'Mass spectrometry',
        technique: 'GCMS'
      };
    }

    if (templateName === 'MSImaging') {
      return {
        main: 'Mass spectrometry',
        technique: 'MS Imaging'
      };
    }

    if (['DI-MS', 'FIA-MS', 'CE-MS', 'MALDI-MS'].includes(templateName)) {
      return {
        main: 'Mass spectrometry',
        technique: 'Direct Injection'
      };
    }

    if (templateName === 'MS') {
      return {
        main: 'Mass spectrometry',
        technique: 'MS'
      };
    }

    return {
      main: 'Mass spectrometry',
      technique: null
    };
  }
  
}

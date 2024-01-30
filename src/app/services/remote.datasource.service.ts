import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, asapScheduler, of } from "rxjs";
import { observeOn } from "rxjs/operators";
import { PaginatedTableColumn, PaginatedTableData } from "../models/mtbl/mtbls/paginated-table";
import { httpOptions } from "./headers";
import { MetabolightsService } from "./metabolights/metabolights.service";

@Injectable({
  providedIn: "root",
})
export class IsaTableDataSourceService {

  constructor(private http: HttpClient, private dataService: MetabolightsService) { }

  getIsaTableRows(studyId: string, isaFileName: string, filter = '', sortOrder = 'asc',
    pageNumber = 0, pageSize = 500, columnNames=null): Observable<any> {
    const result = [];
    if (columnNames === null){
      columnNames = [];
    }
    const body = { data: { isaFileName, pageNumber,  pageSize, columnNames}};

    return this.http.post(this.dataService.url.baseURL + '/studies/'+ studyId +'/isa-table-rows', body, {
      headers: httpOptions.headers,
      observe: "body",
    });

    // const column1 = new PaginatedTableColumn();
    // const column2 = new PaginatedTableColumn();
    // const column3 = new PaginatedTableColumn();
    // column1.columnDef = "database_identifier";
    // column1.header = "database_identifier";
    // column1.targetColumnIndex = 0;

    // column2.columnDef = "inchi";
    // column2.header = "inchi";
    // column2.targetColumnIndex = 1;

    // column3.columnDef = "metabolite_identification";
    // column3.header = "metabolite_identification";
    // column3.targetColumnIndex = 2;

    // const response = new PaginatedTableData<any>();
    // response.metadata.file = isaFileName;
    // response.metadata.currentFilters = [];
    // response.metadata.currentSortOptions = [];
    // response.data = result;
    // response.metadata.currentPage = pageNumber;
    // response.metadata.totalRowCount = 10000000;
    // response.metadata.defaultPageCount = pageSize;
    // response.metadata.currentRowCount = pageSize;
    // response.metadata.columns.push(column1);
    // response.metadata.columns.push(column2);
    // response.metadata.columns.push(column3);
    // response.metadata.columnNames.push("database_identifier");
    // response.metadata.columnNames.push("inchi");
    // response.metadata.columnNames.push("metabolite_identification");
    // response.metadata.totalPageCount = Math.floor(response.metadata.totalRowCount / response.metadata.defaultPageCount);

    // let lastIndex =  pageSize * (pageNumber + 1);
    // if (response.metadata.totalPageCount === response.metadata.currentRowCount) {
    //   lastIndex = response.metadata.totalRowCount;
    // }
    // for (let index = pageNumber*pageSize; index < lastIndex; index++) {
    //   const row = {};
    //   for (let colIndx = 0; colIndx < 3 ; colIndx++) {
    //     row[response.metadata.columns[colIndx].columnDef] = "CHEBI:" + (index + colIndx + 15000)  + colIndx;
    //   }
    //   row["index"] = index;
    //   result.push(row);
    // }

    // console.log(response.metadata.columnNames);
    // return of(response).pipe(observeOn(asapScheduler));


  }
}

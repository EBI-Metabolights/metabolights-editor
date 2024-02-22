import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, asapScheduler, of } from "rxjs";
import { map, observeOn } from "rxjs/operators";
import { PaginatedTableColumnFilter, PaginatedTableColumnSort, PaginatedTableData } from "../models/mtbl/mtbls/paginated-table";

@Injectable({
  providedIn: "root",
})
export class IsaTableDataSourceService {

  constructor(private http: HttpClient) { }

  getIsaTableRows(
    isaFileName: string, filter = '', sortOrder = 'asc',
    pageNumber = 0, pageSize = 500): Observable<PaginatedTableData<any>> {
    const result = [];
    for (let index = pageNumber; index < pageSize * pageNumber + 1; index++) {
      const row = {};
      for (let colIndx = 0; index < 30; index++) {
        row["Col " + colIndx] = "Col Value" + colIndx;
      }
      result.push(row);
    }
    const response = new PaginatedTableData<any>();
    response.metadata.file = isaFileName;
    response.metadata.currentFilters = [];
    response.metadata.currentSortOptions = [];
    response.data = result;
    response.metadata.currentPage = pageNumber;
    response.metadata.totalRowCount = 10000000;
    response.metadata.defaultPageCount = pageSize;
    response.metadata.currentRowCount = pageSize;
    response.metadata.totalPageCount = Math.floor(response.metadata.totalRowCount / response.metadata.defaultPageCount);

    return of(response).pipe(observeOn(asapScheduler));
    // return this.http.get('/metabolights/ws/isa-table/rows', {
    //     params: new HttpParams()
    //         .set('isaFileName', isaFileName)
    //         .set('filter', filter)
    //         .set('sortOrder', sortOrder)
    //         .set('pageNumber', pageNumber.toString())
    //         .set('pageSize', pageSize.toString())
    // }).pipe(
    //     map((res: any) =>  res.payload)
    // );
  }
}

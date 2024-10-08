import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { IsaTableDataSourceService } from "src/app/services/remote.datasource.service";
import { PaginatedTableData, PaginatedTableMetadata } from "../../../models/mtbl/mtbls/paginated-table";

export class ServerDataSource implements DataSource<any> {
  public loading$: Observable<boolean>;

  public data = new BehaviorSubject<any[]>([]);
  public metadata = new BehaviorSubject<PaginatedTableMetadata>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private dataService: IsaTableDataSourceService) {
    this.loading$ = this.loadingSubject.asObservable();
  }

  connect(collectionViewer: CollectionViewer): Observable<any[] | readonly any[]> {
    return this.data.asObservable();
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this.data.complete();
    this.loadingSubject.complete();
  }

  loadIsaTableRows(isaFileName: string, filter = '', sortOrder = 'asc', pageIndex = 0, pageSize = 50) {

        this.loadingSubject.next(true);

        this.dataService.getIsaTableRows(isaFileName, filter, sortOrder,
            pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe((result: PaginatedTableData<any>) => {
          this.metadata.next(result.metadata);
          this.data.next(result.data);
        });
    }
}

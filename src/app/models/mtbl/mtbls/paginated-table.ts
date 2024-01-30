export class PaginatedTableColumnFilter {
  columnName: string = null;
  filter = "";
  order: 'asc' | 'desc' = 'asc';
  filterDataType: 'string' | 'number' = 'string';
  validDataOrder = 1;
  invalidDataOrder = 2;
  emptyDataOrder = 3;
}

export class PaginatedTableColumnSort {
  columnName: string = null;
  sort: 'asc' | 'desc' = 'asc';
  sortDataType: 'string' | 'number' = 'string';
}

export class PaginatedTableColumn {
  columnDef: string = null;
  header: string = null;
  sticky: "false" | "true" = "false";
  targetColumnIndex = -1;
  calculated = false;
}
export class PaginatedTableMetadata {
  file = "";
  pageNumber = 0;
  pageSize = 0;
  defaultPageSize = 50;
  totalSize = 0;
  columnNames: string[] = [];
  columns: PaginatedTableColumn[] = [];
  currentFilters: PaginatedTableColumnFilter[] = [];
  currentSortOptions: PaginatedTableColumnSort[] = [];
}

export class PaginatedTableData<T> {
  metadata: PaginatedTableMetadata = new PaginatedTableMetadata();
  rows: T[] = [];
}

export class PaginatedTableResult<T> {
  content:  PaginatedTableData<T> = null;
}

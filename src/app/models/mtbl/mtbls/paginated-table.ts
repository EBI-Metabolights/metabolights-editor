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
export class PaginatedTableMetadata {
  file = "";
  currentPage = 0;
  currentRowCount = 0;
  defaultPageCount = 50;
  totalRowCount = 0;
  totalPageCount = 0;
  currentFilters: PaginatedTableColumnFilter[] = [];
  currentSortOptions: PaginatedTableColumnSort[] = [];
}

export class PaginatedTableData<T> {
  metadata: PaginatedTableMetadata = new PaginatedTableMetadata();
  data: T[] = [];
}


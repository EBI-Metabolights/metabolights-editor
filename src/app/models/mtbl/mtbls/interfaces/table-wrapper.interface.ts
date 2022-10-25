export interface ITableWrapper {
  data: {
    rows: ITableRow[];
  };
  header: {
    [key: string]: ITableHeader | number;
  };
}

/**
 * Using an index signature parameter here as we return both metabolite annotation files, and assay files,
 * and the contents of those files are different and not consistent IE two assay sheets will not necessarily come back with the same KV pairs.
 * So we instead accept any key value pair so long as both the key and the value are a string.
 */
export interface ITableRow {
  [key: string]: string | number;
}

// defining a type for cleanliness
type HeaderKey = string | number | boolean;

export interface ITableHeader {
  index: number;
  mandatory: boolean;
  // the api returns some keys with hyphens which we can't use or escape in TS, so we hae to use an index signature parameter here too.
  [key: string]: HeaderKey;
}

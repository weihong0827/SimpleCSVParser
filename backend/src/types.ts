
export interface ResponseData {
  data: any[];
  rowCount: number;
  currentPage: number;
  totalPages: number;
}

export interface Filter {
  searchField: string;
  searchValue: string;
  page: number;
  limit: number;
}

export interface ParseReuslt {
  data: any[];
  rowCount: number;
}


export interface Record {
  [key: string]: string;
}
export interface ResponseData {
  data: Record[];
  rowCount: number;
  currentPage: number;
  totalPages: number;
}

export interface HeaderResponse {
  headers: string[];
}


export interface ListFilesResponse {
  files: string[];
}

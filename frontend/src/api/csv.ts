
import axios from '@/lib/axios';
import { Filter } from '@/types/filter';
import { ResponseData, ListFilesResponse, HeaderResponse } from '@/types/csvResponse';

export const listCSV = async (): Promise<ListFilesResponse> => {
  const response = await axios.get<ListFilesResponse>('/listFiles');
  console.log(response.data)
  return response.data;
}


export const parseFile = async (filename: string, filter: Filter): Promise<ResponseData> => {
  console.log('api', filter)

  const query = new URLSearchParams({
    searchField: filter.searchField || '',
    searchValue: filter.searchValue || '',
    page: filter.page.toString(),
    limit: filter.limit.toString(),
  }
  ).toString()
  const URL = `/parse/${filename}?${query}`

  const response = await axios.get<ResponseData>(URL);
  return response.data;
}

export const getCSVHeader = async (filename: string): Promise<HeaderResponse> => {
  const response = await axios.get<HeaderResponse>(`/headers/${filename}`);
  return response.data;
}


export const uploadCSV = async (formData: FormData) => {
  const response = await axios.post('/upload', formData);
  return response.data;
}


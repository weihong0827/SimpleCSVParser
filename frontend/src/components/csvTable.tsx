
"use client"

import * as React from "react"

import { Filter } from '@/types/filter';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCSVHeader, listCSV, parseFile } from "@/api/csv"
import { HeaderResponse, ListFilesResponse, Record, ResponseData } from "@/types/csvResponse";
import { CustomSelect } from "@/components/headerSelect"

import { useDebouncedCallback } from 'use-debounce';
import { CustomPagination } from "./customPagniation";
import { Button } from "./ui/button";

import axios from "@/lib/axios"



export function CSVTable() {
  const queryClient = useQueryClient()
  const { data: csvList } = useQuery<ListFilesResponse>({ queryKey: ["listCSV"], queryFn: listCSV })
  const [selectedCSV, setSelectedCSV] = React.useState<string>("")
  const [filterOptions, setFilterOptions] = React.useState<Filter>({
    page: 1,
    limit: 10,
  })

  const { data: csvData } = useQuery<ResponseData>({ queryKey: ["getCSV", selectedCSV, filterOptions], queryFn: () => parseFile(selectedCSV, filterOptions), enabled: selectedCSV !== "" })

  const { data: headerResponse } = useQuery<HeaderResponse>({ queryKey: ["getCSVHeader", selectedCSV], queryFn: () => getCSVHeader(selectedCSV), enabled: selectedCSV !== "" })


  const debouncedFilterValue = useDebouncedCallback((value: string) => {
    setFilterOptions((prev) => ({ ...prev, searchValue: value }))

      , 300
  });
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const data = new FormData(event.target as HTMLFormElement)
    await axios.post('/upload', data)
    queryClient.invalidateQueries({ queryKey: ["listCSV"] })
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 py-4">
        <div className="flex gap-2">
          <CustomSelect label="File List" list={csvList?.files ?? []} onSelect={(file) => setSelectedCSV(file)} />
          <CustomSelect label="Header" list={headerResponse?.headers ?? []} onSelect={(header) => setFilterOptions((prev) => ({ ...prev, searchField: header }))} />
          <Input
            placeholder="Content to search for"
            value={filterOptions.searchValue || ""}
            onChange={(event) =>
              debouncedFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input type='file' name="csvfile" className="max-w-sm" />
          <Button
            type='submit'>Upload</Button>
        </form>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow >
              {headerResponse?.headers.map((header) => {
                return (
                  <TableHead key={header}>
                    {header}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvData?.data.length ? (
              csvData?.data.map((row: Record) => (
                <TableRow key={row.id}>
                  {headerResponse?.headers.map((header) => {
                    return (
                      <TableCell key={header}>
                        {row[header]}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headerResponse?.headers.length || 0}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <CustomPagination totalPages={csvData?.totalPages ?? 0} currentPage={filterOptions.page} setFilterOptions={setFilterOptions} />

      </div>
    </div >
  )
}

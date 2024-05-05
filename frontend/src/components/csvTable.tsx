
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Filter } from '@/types/filter';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useQuery } from "@tanstack/react-query"
import { getCSVHeader, listCSV, parseFile } from "@/api/csv"
import { HeaderResponse, ListFilesResponse, ResponseData } from "@/types/csvResponse";
import { HeaderSelect } from "@/components/headerSelect"

import { useDebouncedCallback } from 'use-debounce';



export function CSVTable() {
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
    console.log('debounced', filterOptions)

      , 300
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <HeaderSelect headers={csvList?.files ?? []} onSelect={(header) => setSelectedCSV(header)} />
        <HeaderSelect headers={headerResponse?.headers ?? []} onSelect={(header) => setFilterOptions((prev) => ({ ...prev, searchField: header }))} />
        <Input
          placeholder="Content to search for"
          value={filterOptions.searchValue || ""}
          onChange={(event) =>
            debouncedFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        {/* <Table> */}
        {/*   <TableHeader> */}
        {/*     {table.getHeaderGroups().map((headerGroup) => ( */}
        {/*       <TableRow key={headerGroup.id}> */}
        {/*         {headerGroup.headers.map((header) => { */}
        {/*           return ( */}
        {/*             <TableHead key={header.id}> */}
        {/*               {header.isPlaceholder */}
        {/*                 ? null */}
        {/*                 : flexRender( */}
        {/*                   header.column.columnDef.header, */}
        {/*                   header.getContext() */}
        {/*                 )} */}
        {/*             </TableHead> */}
        {/*           ) */}
        {/*         })} */}
        {/*       </TableRow> */}
        {/*     ))} */}
        {/*   </TableHeader> */}
        {/*   <TableBody> */}
        {/*     {table.getRowModel().rows?.length ? ( */}
        {/*       table.getRowModel().rows.map((row) => ( */}
        {/*         <TableRow */}
        {/*           key={row.id} */}
        {/*           data-state={row.getIsSelected() && "selected"} */}
        {/*         > */}
        {/*           {row.getVisibleCells().map((cell) => ( */}
        {/*             <TableCell key={cell.id}> */}
        {/*               {flexRender( */}
        {/*                 cell.column.columnDef.cell, */}
        {/*                 cell.getContext() */}
        {/*               )} */}
        {/*             </TableCell> */}
        {/*           ))} */}
        {/*         </TableRow> */}
        {/*       )) */}
        {/*     ) : ( */}
        {/*       <TableRow> */}
        {/*         <TableCell */}
        {/*           colSpan={columns.length} */}
        {/*           className="h-24 text-center" */}
        {/*         > */}
        {/*           No results. */}
        {/*         </TableCell> */}
        {/*       </TableRow> */}
        {/*     )} */}
        {/*   </TableBody> */}
        {/* </Table> */}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground"> */}
        {/*   {table.getFilteredSelectedRowModel().rows.length} of{" "} */}
        {/*   {table.getFilteredRowModel().rows.length} row(s) selected. */}
        {/* </div> */}
        {/* <div className="space-x-2"> */}
        {/*   <Button */}
        {/*     variant="outline" */}
        {/*     size="sm" */}
        {/*     onClick={() => table.previousPage()} */}
        {/*     disabled={!table.getCanPreviousPage()} */}
        {/*   > */}
        {/*     Previous */}
        {/*   </Button> */}
        {/*   <Button */}
        {/*     variant="outline" */}
        {/*     size="sm" */}
        {/*     onClick={() => table.nextPage()} */}
        {/*     disabled={!table.getCanNextPage()} */}
        {/*   > */}
        {/*     Next */}
        {/*   </Button> */}
        {/* </div> */}
      </div>
    </div >
  )
}

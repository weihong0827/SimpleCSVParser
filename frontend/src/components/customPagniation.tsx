
'use client';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Filter } from "@/types/filter";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


export function CustomPagination({ currentPage, totalPages, setFilterOptions }: {
  currentPage: number,
  totalPages: number,
  setFilterOptions: React.Dispatch<React.SetStateAction<Filter>>
}) {
  const safeCurrentPage = currentPage ?? 1;
  const safeTotalPages = totalPages ?? 1;
  const setCurrentPage = (page: number) => {
    setFilterOptions((prev: Filter) => ({ ...prev, page: page }))
  }


  // Function to determine whether to show an ellipsis
  const shouldShowEllipsis = (page: number): boolean => {
    return Math.abs(safeCurrentPage - page) > 1 && page !== 1 && page !== safeTotalPages;
  };

  // Function to generate pagination items
  const paginationItems = () => {
    const items: React.ReactNode[] = [];
    for (let page = 1; page <= safeTotalPages; page++) {
      // Show ellipsis logic
      if (shouldShowEllipsis(page) && page < safeCurrentPage) {
        if (!items.some((item) => React.isValidElement(item) && item.key === 'left-ellipsis')) {
          items.push(
            <PaginationItem key="left-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        continue;
      } else if (shouldShowEllipsis(page) && page > safeCurrentPage) {
        if (!items.some((item) => React.isValidElement(item) && item.key === 'right-ellipsis')) {
          items.push(
            <PaginationItem key="right-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        continue;
      }

      // Page link logic
      items.push(
        <PaginationItem key={page}>
          <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
          </PaginationItem>
        )}
        {paginationItems()}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
          </PaginationItem>
        )}

        <PaginationItem className="flex gap-4">
          <Label className="flex items-center">Go to page</Label>
          <Input type="number" min="1" max={totalPages} value={currentPage} onChange={(e) => {
            const value = parseInt((e.target as HTMLInputElement).value);
            if (value >= 1 && value <= totalPages) {
              setCurrentPage(value);
            }
          }} />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}



import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function HeaderSelect({ headers, onSelect }: { headers: string[], onSelect: (header: string) => void }) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a header" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Headers</SelectLabel>
          {headers.map((header) => (
            <SelectItem key={header} value={header}>
              {header}
            </SelectItem>
          ))}

        </SelectGroup>
      </SelectContent>
    </Select>
  )
}



import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function CustomSelect({ list, onSelect, label }: { list: string[], onSelect: (item: string) => void, label?: string }) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {list.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}

        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

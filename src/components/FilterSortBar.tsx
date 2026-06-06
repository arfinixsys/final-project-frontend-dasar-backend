import { Filter, ArrowUpDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface FilterOption<T extends string> {
  value: T
  label: string
}

interface FilterSortBarProps<T extends string, U extends string> {
  filterLabel?: string
  filters: FilterOption<T>[]
  activeFilter: T
  onFilterChange: (value: T) => void
  sortLabel?: string
  sorts: FilterOption<U>[]
  activeSort: U
  onSortChange: (value: U) => void
}

export default function FilterSortBar<T extends string, U extends string>({
  filterLabel = 'Filter',
  filters,
  activeFilter,
  onFilterChange,
  sortLabel = 'Sort',
  sorts,
  activeSort,
  onSortChange,
}: FilterSortBarProps<T, U>) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Filter size={14} />
            {filters.find((f) => f.value === activeFilter)?.label ??
              filterLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {filters.map((f) => (
            <DropdownMenuItem
              key={f.value}
              onSelect={() => onFilterChange(f.value)}
              className="flex items-center justify-between gap-4 text-sm"
            >
              {f.label}
              {activeFilter === f.value && (
                <Check size={14} className="shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowUpDown size={14} />
            {sorts.find((o) => o.value === activeSort)?.label ?? sortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sorts.map((o) => (
            <DropdownMenuItem
              key={o.value}
              onSelect={() => onSortChange(o.value)}
              className="flex items-center justify-between gap-4 text-sm"
            >
              {o.label}
              {activeSort === o.value && (
                <Check size={14} className="shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

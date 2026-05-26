import { Search } from 'lucide-react'

interface FilterOption {
    value: string
    label: string
}

interface FilterProps {
    name: string
    options: FilterOption[]
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    placeholder?: string
}

interface FilterSectionProps {
    filters?: FilterProps[]
    searchQuery?: string
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchPlaceholder?: string
}

export function FilterSection({
    filters = [],
    searchQuery = '',
    onSearchChange,
    searchPlaceholder = 'Search...'
}: FilterSectionProps) {
    return (
        <div className="bg-white dark:bg-black p-4 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/80 dark:border-white/10 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            {onSearchChange && (
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-[#00b3a7]/20 focus:border-[#00b3a7] sm:text-sm text-gray-900 dark:text-gray-100 transition-all"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={onSearchChange}
                    />
                </div>
            )}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {filters.map((filter, index) => (
                    <select
                        key={index}
                        name={filter.name}
                        value={filter.value}
                        onChange={filter.onChange}
                        className="block w-full sm:w-auto pl-3 pr-10 py-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-[#00b3a7]/20 focus:border-[#00b3a7] sm:text-sm rounded-xl border text-gray-900 dark:text-gray-100 transition-all"
                    >
                        {filter.placeholder && (
                            <option value="" disabled className="text-gray-400">
                                {filter.placeholder}
                            </option>
                        )}
                        {filter.options.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">{opt.label}</option>
                        ))}
                    </select>
                ))}
            </div>
        </div>
    )
}

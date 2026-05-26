import React, { forwardRef } from 'react'
import { cn } from '../lib/utils'

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    error?: string
    options: SelectOption[]
    placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
                <select
                    className={cn(
                        "flex h-10 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black hover:bg-white dark:hover:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#00b3a7]/20 focus:border-[#00b3a7] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled className="bg-white dark:bg-black text-gray-400">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Select.displayName = "Select"

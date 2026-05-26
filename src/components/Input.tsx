import React, { forwardRef } from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black hover:bg-white dark:hover:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#00b3a7]/20 focus:border-[#00b3a7] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

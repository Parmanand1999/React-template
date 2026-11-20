import { Search, X } from 'lucide-react'
import React from 'react'

const CustomSearch = ({
    searchQuery,
    setSearchQuery,
    placeholder = "Search...",
    className = "",
    inputClassName = "",
    size = "md", // "sm" (h-8) | "md" (h-9) | "lg" (h-10)
}) => {
    const sizeClasses =
        size === "sm"
            ? "h-8 pl-8 pr-7 text-xs rounded-lg"
            : size === "lg"
            ? "h-10 pl-10 pr-9 text-sm rounded-xl"
            : "h-9 pl-9 pr-8 text-xs rounded-lg";

    const iconSize = size === "sm" ? 14 : size === "lg" ? 17 : 15;

    return (
        <div className={`relative w-full ${className}`}>
            <Search
                size={iconSize}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className={`w-full border border-slate-200 bg-white text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 ${sizeClasses} ${inputClassName}`}
            />
            {searchQuery && (
                <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label="Clear search"
                >
                    <X size={iconSize} />
                </button>
            )}
        </div>
    )
}

export default CustomSearch
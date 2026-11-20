import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react";
import useDebounce from "@/hooks/useDebounceHook";

const MultiSelectInfiniteDropdown = ({
    label,
    placeholder,
    selectedValues,
    onSelectionChange,
    fetchOptions,
    fetchDependencies = {},
    isDisabled = false,
    isSearchable = true,
    startIcon,
    className = "",
    buttonClassName = "",
    dropdownClassName = "",
    selectedTagClassName = "",
    getOptionLabel,
    getOptionDescription,
    pageSize = 10,
    debounceDelay = 1000,
    scrollThreshold = 50,
    maxDropdownHeight = "max-h-56",
    required=false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const dropdownContainerRef = useRef(null);
    const optionsListRef = useRef(null);
    const isMountedRef = useRef(true);

    const debouncedSearchTerm = useDebounce(searchTerm.trim(), debounceDelay);
    // console.log(fetchOptions(), "fetchOptions");

    const isOptionSelected = useCallback((optionId) => {
        return selectedValues.some(selected => selected._id === optionId || selected.id === optionId);
    }, [selectedValues]);

    const loadOptions = useCallback(async (shouldReset = false) => {
        if (!isMountedRef.current || isLoading) return;

        const pageToFetch = shouldReset ? 1 : currentPage;

        if (!shouldReset && !hasMoreData) return;

        setIsLoading(true);

        try {
            const response = await fetchOptions({
                page: pageToFetch,
                search: debouncedSearchTerm,
                pageSize: pageSize,
                ...fetchDependencies
            });
            console.log(response, "response 6666");

            if (!isMountedRef.current) return;

            let newOptions = [];
            let newHasMore = false;
            let newTotalItems = 0;
            let nextPage = pageToFetch + 1;

            if (response && response.data) {
                newOptions = response.data;

                if (response.pagination) {
                    newHasMore = response.pagination.hasNextPage;
                    newTotalItems = response.pagination.totalItems;
                    nextPage = response.pagination.currentPage + 1;
                } else {
                    newHasMore = response.data.length === pageSize;
                    newTotalItems = shouldReset ? response.data.length : totalItems + response.data.length;
                }
            }

            setOptions(prev => shouldReset ? newOptions : [...prev, ...newOptions]);
            setHasMoreData(newHasMore);
            setTotalItems(newTotalItems);
            setCurrentPage(nextPage);

        } catch (error) {
            console.error("Error loading options:", error);
            if (isMountedRef.current) {
                setHasMoreData(false);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [fetchOptions, debouncedSearchTerm, pageSize, fetchDependencies, isLoading, currentPage, hasMoreData, totalItems]);

    useEffect(() => {
        if (isOpen && !isDisabled) {
            setCurrentPage(1);
            setOptions([]);
            setHasMoreData(true);
            setTotalItems(0);
            loadOptions(true);
        }
    }, [isOpen, debouncedSearchTerm, isDisabled]);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    setSearchTerm("");
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleScroll = useCallback(() => {
        const container = optionsListRef.current;
        if (!container || isLoading || !hasMoreData) return;

        const { scrollTop, clientHeight, scrollHeight } = container;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - scrollThreshold;

        if (isNearBottom) {
            loadOptions(false);
        }
    }, [isLoading, hasMoreData, scrollThreshold, loadOptions]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
        setOptions([]);
        setHasMoreData(true);
        setTotalItems(0);
    };

    const handleToggleOption = useCallback((option) => {
        const isSelected = isOptionSelected(option._id || option.id);

        if (isSelected) {
            onSelectionChange(selectedValues.filter(selected =>
                (selected._id || selected.id) !== (option._id || option.id)
            ));
        } else {
            onSelectionChange([...selectedValues, option]);
        }
    }, [selectedValues, onSelectionChange, isOptionSelected]);

    const handleRemoveTag = useCallback((optionId, event) => {
        event.stopPropagation();
        onSelectionChange(selectedValues.filter(selected =>
            (selected._id || selected.id) !== optionId
        ));
    }, [selectedValues, onSelectionChange]);

    const handleClearAll = useCallback((event) => {
        event.stopPropagation();
        onSelectionChange([]);
    }, [onSelectionChange]);

    const toggleDropdown = useCallback(() => {
        if (!isDisabled) {
            setIsOpen(prev => !prev);
        }
    }, [isDisabled]);

    return (
        <div className={`relative w-full ${className}`} ref={dropdownContainerRef}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                    { required && <span className="ml-1 text-destructive">*</span>}
                </label>
            )}

            <button
                type="button"
                disabled={isDisabled}
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`
                    flex  w-full items-center justify-between 
                    rounded-xl border bg-white px-4 py-2 text-left text-sm 
                    shadow-sm transition-all duration-200
                    ${isDisabled
                        ? "cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
                        : "border-slate-200 hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    }
                    ${buttonClassName}
                `}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {startIcon && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {startIcon}
                        </span>
                    )}

                    <div className="flex flex-1 flex-wrap gap-1.5">
                        {selectedValues?.length > 0 ? (
                            <>
                                {selectedValues?.map((option) => (
                                    <span
                                        key={option._id || option.id}
                                        className={`inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary ${selectedTagClassName}`}
                                    >
                                        {getOptionLabel(option)}
                                        <X
                                            size={12}
                                            className="cursor-pointer hover:text-red-600 transition-colors"
                                            onClick={(e) => handleRemoveTag(option._id || option.id, e)}
                                        />
                                    </span>
                                ))}
                                {selectedValues.length > 1 && (
                                    <span
                                        onClick={handleClearAll}
                                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear all
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </div>
                </div>

                <ChevronDown
                    size={16}
                    className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && !isDisabled && (
                <div className={`
                    absolute z-50 mt-2 w-full 
                    rounded-2xl border border-slate-200 
                    bg-white shadow-xl overflow-hidden
                    ${dropdownClassName}
                `}>
                    {isSearchable && (
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search branches..."
                                className="h-9 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 focus:ring-0"
                                autoFocus
                            />
                        </div>
                    )}

                    <div
                        ref={optionsListRef}
                        onScroll={handleScroll}
                        className={`${maxDropdownHeight} overflow-y-auto`}
                    >
                        <div className="p-2">
                            {options.map((option) => {
                                const isSelected = isOptionSelected(option._id || option.id);
                                return (
                                    <button
                                        key={option._id || option.id}
                                        type="button"
                                        onClick={() => handleToggleOption(option)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between
                                            ${isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isSelected ? 'text-primary font-semibold' : 'text-slate-800 font-medium'}`}>
                                                {getOptionLabel(option)}
                                            </p>
                                            {getOptionDescription && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                    {getOptionDescription(option)}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check size={16} className="ml-2 shrink-0 text-primary" />
                                        )}
                                    </button>
                                );
                            })}

                            {isLoading && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Loading branches...</span>
                                </div>
                            )}

                            {!isLoading && options.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-slate-400">
                                        {searchTerm ? "No matching branches found" : "No branches available"}
                                    </p>
                                </div>
                            )}

                            {!isLoading && !hasMoreData && options.length > 0 && (
                                <div className="py-3 text-center text-xs text-slate-400">
                                    End of results
                                </div>
                            )}
                        </div>
                    </div>

                    {!isLoading && options.length > 0 && totalItems > options.length && (
                        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
                            <p className="text-xs text-slate-500 text-center">
                                Showing {options.length} of {totalItems} branches
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectInfiniteDropdown;
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react";
import useDebounce from "@/hooks/useDebounceHook";
import CustomButton from "../Buttons/CustomButton";

const SingleSelectInfiniteDropdown = ({
    // ===== LABEL & PLACEHOLDER =====
    label,
    placeholder,

    // ===== VALUE BINDING =====
    selectedValue,
    onSelectionChange,

    // ===== DATA FETCHING =====
    fetchOptions,
    fetchDependencies = {},

    // ===== BEHAVIOR =====
    isDisabled = false,
    isSearchable = true,
    requireConfirmation = false, // New prop: if true, requires clicking "Okay" to confirm selection

    // ===== VISUAL CUSTOMIZATION =====
    startIcon,
    className = "",
    buttonClassName = "",
    dropdownClassName = "",

    // ===== RENDERING FUNCTIONS =====
    getOptionLabel,
    getOptionDescription,

    // ===== DATA FILTERING =====
    excludedOptionIds = [],

    // ===== PAGINATION CONFIGURATION =====
    pageSize = 10,
    debounceDelay = 500,
    scrollThreshold = 50,
}) => {
    // ===== STATE MANAGEMENT =====
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [tempSelectedOption, setTempSelectedOption] = useState(null); // For confirmation flow

    // ===== REFS =====
    const dropdownContainerRef = useRef(null);
    const optionsListRef = useRef(null);
    const isMountedRef = useRef(true);

    // ===== CUSTOM HOOKS =====
    const debouncedSearchTerm = useDebounce(searchTerm.trim(), debounceDelay);

    // ===== DERIVED VALUES =====
    const displayOption = selectedOption || tempSelectedOption;
    const selectedOptionLabel = displayOption ? getOptionLabel(displayOption) : "";
    const filteredOptions = useMemo(
        () => options.filter((option) => !excludedOptionIds.includes(option._id)),
        [options, excludedOptionIds]
    );

    // ===== API CALL HANDLER =====
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
                } else if (response.hasNextPage !== undefined) {
                    newHasMore = response.hasNextPage;
                    newTotalItems = response.totalItems || response.data.length;
                } else {
                    newHasMore = response.data.length === pageSize;
                    newTotalItems = shouldReset ? response.data.length : totalItems + response.data.length;
                }
            }

            setOptions(prevOptions =>
                shouldReset ? newOptions : [...prevOptions, ...newOptions]
            );

            setHasMoreData(newHasMore);
            setTotalItems(newTotalItems);
            setCurrentPage(nextPage);

        } catch (error) {
            console.error("Error loading options in dropdown:", error);
            if (isMountedRef.current) {
                setHasMoreData(false);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [fetchOptions, debouncedSearchTerm, pageSize, fetchDependencies, isLoading, currentPage, hasMoreData, totalItems]);

    // ===== EFFECTS =====

    // Initialize selected option from prop
    useEffect(() => {
        if (selectedValue) {
            setSelectedOption(selectedValue);
            setTempSelectedOption(null);
        } else {
            setSelectedOption(null);
            setTempSelectedOption(null);
        }
    }, [selectedValue]);

    // Load data when dropdown opens or search changes
    useEffect(() => {
        if (isOpen && !isDisabled) {
            setCurrentPage(1);
            setOptions([]);
            setHasMoreData(true);
            setTotalItems(0);
            loadOptions(true);
        }
    }, [isOpen, debouncedSearchTerm, isDisabled]);

    // Reset search when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    setSearchTerm("");
                    // Clear temp selection when dropdown closes without confirming
                    if (requireConfirmation) {
                        setTempSelectedOption(null);
                    }
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, requireConfirmation]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ===== EVENT HANDLERS =====

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
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);

        setCurrentPage(1);
        setOptions([]);
        setHasMoreData(true);
        setTotalItems(0);
    };

    const handleOptionSelect = (option) => {
        if (requireConfirmation) {
            // In confirmation mode, just set temp selection
            setTempSelectedOption(option);
        } else {
            // Direct selection mode
            setSelectedOption(option);
            onSelectionChange(option);
            setIsOpen(false);
            setTimeout(() => {
                if (isMountedRef.current) {
                    setSearchTerm("");
                }
            }, 200);
        }
    };

    const handleConfirmSelection = () => {
        if (tempSelectedOption) {
            setSelectedOption(tempSelectedOption);
            onSelectionChange(tempSelectedOption);
            setTempSelectedOption(null);
            setIsOpen(false);
            setTimeout(() => {
                if (isMountedRef.current) {
                    setSearchTerm("");
                }
            }, 200);
        }
    };

    const handleCancelSelection = () => {
        setTempSelectedOption(null);
        setIsOpen(false);
        setTimeout(() => {
            if (isMountedRef.current) {
                setSearchTerm("");
            }
        }, 200);
    };

    const clearSelection = (event) => {
        event.stopPropagation();
        setSelectedOption(null);
        setTempSelectedOption(null);
        onSelectionChange(null);
    };

    const toggleDropdown = () => {
        if (!isDisabled) {
            setIsOpen(prev => !prev);
            // Reset temp selection when reopening
            if (requireConfirmation) {
                setTempSelectedOption(null);
            }
        }
    };

    // ===== RENDER HELPERS =====

    const renderEmptyState = () => (
        <div className="py-8 text-center">
            <p className="text-sm text-slate-400">
                {searchTerm ? "No matching results found" : "No data available"}
            </p>
        </div>
    );

    const renderOption = (option) => {
        const isSelected = requireConfirmation 
            ? tempSelectedOption?._id === option._id
            : selectedOption?._id === option._id;

        return (
            <button
                key={option._id || option.id}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-left
                    ${isSelected 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'hover:bg-slate-50 focus:bg-slate-50 text-slate-700'
                    }
                    focus:outline-none
                `}
            >
                <div className="min-w-0 flex-1">
                    <p className={`text-sm capitalize truncate ${isSelected ? 'text-primary font-semibold' : 'text-slate-800 font-medium'}`}>
                        {getOptionLabel(option)}
                    </p>
                    {getOptionDescription && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {getOptionDescription(option)}
                        </p>
                    )}
                </div>
                {isSelected && (
                    <Check size={16} className="text-primary shrink-0 ml-2" />
                )}
            </button>
        );
    };

    const renderPaginationInfo = () => (
        totalItems > 0 && (
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500 text-center">
                    Showing {options.length} of {totalItems} items
                </p>
            </div>
        )
    );

    // ===== MAIN RENDER =====
    return (
        <div className={`relative w-full ${className}`} ref={dropdownContainerRef}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                </label>
            )}

            {/* Dropdown Button */}
            <button
                type="button"
                disabled={isDisabled}
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`
                    flex h-[44px] w-full items-center justify-between 
                    rounded-lg border bg-white px-4 text-left text-sm 
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
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {startIcon}
                        </span>
                    )}
                    <span className={`truncate ${selectedOptionLabel ? "font-medium text-slate-800" : "text-slate-400"}`}>
                        {selectedOptionLabel || placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {selectedValue && (
                        <X
                            size={16}
                            className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                            onClick={clearSelection}
                        />
                    )}
                    <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && !isDisabled && (
                <div className={`
                    absolute z-50 mt-2 w-full 
                    rounded-2xl border border-slate-200 
                    bg-white shadow-xl overflow-hidden
                    ${dropdownClassName}
                `}>
                    {/* Search Input */}
                    {isSearchable && (
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search..."
                                className="h-9 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 focus:ring-0"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Options List */}
                    <div
                        ref={optionsListRef}
                        onScroll={handleScroll}
                        className="max-h-56 overflow-y-auto"
                    >
                        <div className="p-2">
                            {filteredOptions.map(renderOption)}

                            {isLoading && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            )}

                            {!isLoading && filteredOptions.length === 0 && renderEmptyState()}
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {!isLoading && filteredOptions.length > 0 && totalItems > options.length && renderPaginationInfo()}

                    {/* Confirmation Buttons - Only show when an option is selected in confirmation mode */}
                    {requireConfirmation && tempSelectedOption && (
                        <div className="flex justify-end gap-2 p-3 border-t border-slate-100 bg-slate-50">
                            <CustomButton 
                                type="button" 
                                variant="outline"
                                onClick={handleCancelSelection}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton 
                                type="button"
                                onClick={handleConfirmSelection}
                            >
                                Okay
                            </CustomButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SingleSelectInfiniteDropdown;
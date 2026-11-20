import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X, Check } from "lucide-react";

const SearchableSelect = ({
  label,
  placeholder = "Select option",
  options = [], // [{ label, value, ... }]
  value = "",
  onChange,
  disabled = false,
  required = false,
  className = "",
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Position calculation for portal
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setCoords({
        top: openUpward ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);
      return () => {
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    const text = (
      (opt.label || opt.name || "") +
      " " +
      (opt.description || opt.subText || "")
    ).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  // Selected label display
  const selectedOption = options.find(
    (opt) => opt.value === value || opt.name === value || opt.label === value
  );
  const displayLabel = selectedOption
    ? selectedOption.label || selectedOption.name
    : value;

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`h-9 w-full rounded-lg border px-3 text-xs sm:text-sm flex items-center justify-between cursor-pointer transition select-none ${
          disabled
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            : error
            ? "border-rose-400 bg-white text-slate-800"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-[90%]">
          {selectedOption?.isoCode ? (
            <img
              src={`https://flagcdn.com/w40/${selectedOption.isoCode.toLowerCase()}.png`}
              alt={selectedOption.isoCode}
              className="w-4 h-3 object-cover rounded-xs border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : selectedOption?.flag ? (
            <span className="text-sm shrink-0">{selectedOption.flag}</span>
          ) : selectedOption?.icon ? (
            <span className="shrink-0 text-slate-500">
              {selectedOption.icon}
            </span>
          ) : null}

          <span
            className={`truncate ${
              displayLabel ? "text-slate-800 font-medium" : "text-slate-400"
            }`}
          >
            {displayLabel || placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </div>

      {error && (
        <p className="text-rose-500 text-[11px] mt-0.5">
          {typeof error === "string" ? error : error?.message}
        </p>
      )}

      {/* Floating Dropdown List rendered via Portal to prevent any parent overflow clipping */}
      {isOpen &&
        !disabled &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.openUpward ? "auto" : `${coords.top}px`,
              bottom: coords.openUpward
                ? `${Math.max(8, window.innerHeight - coords.top)}px`
                : "auto",
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fadeIn text-xs"
          >
            {/* Search box inside dropdown */}
            <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${
                  label ? label.toLowerCase() : "options"
                }...`}
                className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
              {searchTerm && (
                <X
                  size={14}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            {/* List of items */}
            <div className="max-h-52 overflow-y-auto p-1 divide-y divide-slate-50">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const optVal = opt.value ?? opt.name;
                  const optLabel = opt.label ?? opt.name;
                  const isSelected = value === optVal || value === optLabel;

                  return (
                    <div
                      key={opt.id || optVal || optLabel}
                      onClick={() => {
                        onChange(optVal, opt);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        {opt.isoCode ? (
                          <img
                            src={`https://flagcdn.com/w40/${opt.isoCode.toLowerCase()}.png`}
                            alt={opt.isoCode}
                            className="w-4 h-3 object-cover rounded-xs border border-slate-200 shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : opt.flag ? (
                          <span className="text-sm shrink-0">{opt.flag}</span>
                        ) : opt.icon ? (
                          <span className="shrink-0 text-slate-400">
                            {opt.icon}
                          </span>
                        ) : null}
                        <div className="flex flex-col min-w-0 truncate">
                          <span className="truncate">{optLabel}</span>
                          {(opt.description || opt.subText) && (
                            <span className="text-[11px] text-slate-400 font-normal truncate">
                              {opt.description || opt.subText}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.isoCode && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {opt.isoCode}
                          </span>
                        )}
                        {isSelected && (
                          <Check size={16} className="text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-slate-400 text-xs">
                  No matches found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SearchableSelect;


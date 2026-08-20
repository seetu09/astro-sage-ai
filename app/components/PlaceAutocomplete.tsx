"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface SelectedPlace {
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: SelectedPlace) => void;
  placeholder?: string;
  inputClassName?: string;
  required?: boolean;
}

const formatPlaceName = (place: GeocodingResult): string =>
  `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}${place.country ? `, ${place.country}` : ""}`;

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "City, State, Country",
  inputClassName = "",
  required = false,
}: PlaceAutocompleteProps) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search (300ms) — only fetch when 2+ characters are typed
  useEffect(() => {
    const query = value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      if (abortRef.current) abortRef.current.abort();
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
        { signal: controller.signal }
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch places");
          return res.json();
        })
        .then((data) => {
          const list: GeocodingResult[] = data?.results ?? [];
          setResults(list);
          setIsOpen(list.length > 0);
          setActiveIndex(-1);
          setError(null);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setResults([]);
          setIsOpen(false);
          setError("Couldn't find that place. Please try again.");
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleSelect = (place: GeocodingResult) => {
    const formatted = formatPlaceName(place);
    onChange(formatted);
    onSelect?.({
      placeName: formatted,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone ?? "",
    });
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length >= 2 && results.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="place-autocomplete-list"
        aria-autocomplete="list"
        required={required}
      />

      {isOpen && (
        <ul
          id="place-autocomplete-list"
          role="listbox"
          className="absolute z-50 mt-1 w-full glass-card rounded-xl overflow-hidden shadow-lg max-h-64 overflow-y-auto scrollbar-thin"
        >
          {isLoading && (
            <li className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Searching locations...
            </li>
          )}

          {!isLoading && error && (
            <li className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-500">{error}</li>
          )}

          {!isLoading && !error && results.length === 0 && (
            <li className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
              No locations found
            </li>
          )}

          {!isLoading &&
            !error &&
            results.map((place, i) => {
              const selected = i === activeIndex;
              const label = formatPlaceName(place);
              return (
                <li
                  key={`${place.latitude}-${place.longitude}-${place.name}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(place);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm cursor-pointer transition-colors border-b border-slate-200/60 dark:border-white/5 last:border-0 ${
                    selected ? "bg-violet-50 dark:bg-white/10" : "hover:bg-violet-50 dark:hover:bg-white/10"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-violet-600 dark:text-[#FFD166]" />
                  <span className="truncate text-indigo-950 dark:text-[#F3F4F6]">{label}</span>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
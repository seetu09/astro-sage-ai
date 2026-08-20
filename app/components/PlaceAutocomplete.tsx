"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, Crosshair } from "lucide-react";

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

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  localityInfo?: {
    informative?: Array<{ name?: string; description?: string }>;
  };
}

interface NominatimAddress {
  suburb?: string;
  town?: string;
  city?: string;
  state?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
}

const PIN_CODE_REGEX = /^\d{6}$/;

const formatNominatimPlace = (item: NominatimResult): string => {
  const city =
    item.address?.suburb ||
    item.address?.town ||
    item.address?.city ||
    (item.display_name ? item.display_name.split(",")[0] : "") ||
    "";
  const state = item.address?.state || "";
  return [city.trim(), state.trim(), "India"].filter(Boolean).join(", ");
};

const mapNominatimResult = (item: NominatimResult): GeocodingResult => ({
  name: formatNominatimPlace(item),
  latitude: parseFloat(item.lat),
  longitude: parseFloat(item.lon),
  timezone: "Asia/Kolkata",
});

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: SelectedPlace) => void;
  onClear?: () => void;
  latitude?: number | null;
  longitude?: number | null;
  onLatitudeChange?: (value: number | null) => void;
  onLongitudeChange?: (value: number | null) => void;
  placeholder?: string;
  inputClassName?: string;
  required?: boolean;
}

type LocationInputMode = "search" | "coordinates";

const formatPlaceName = (place: GeocodingResult): string =>
  `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}${place.country ? `, ${place.country}` : ""}`;

const parseCoordinate = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

const isValidLatitude = (value: number): boolean => value >= -90 && value <= 90;
const isValidLongitude = (value: number): boolean => value >= -180 && value <= 180;

const extractTimezone = (data: ReverseGeocodeResponse): string => {
  if (data?.localityInfo?.informative) {
    const tz = data.localityInfo.informative.find(
      (item) => item?.description?.toLowerCase() === "time zone"
    );
    if (tz?.name) return tz.name;
  }
  return "";
};

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  onClear,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  placeholder = "Enter city, town, or PIN code...",
  inputClassName = "",
  required = false,
}: PlaceAutocompleteProps) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Dual-mode state
  const [mode, setMode] = useState<LocationInputMode>("search");
  const [latInput, setLatInput] = useState<string>(
    latitude != null ? String(latitude) : ""
  );
  const [lngInput, setLngInput] = useState<string>(
    longitude != null ? String(longitude) : ""
  );
  const [isResolving, setIsResolving] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reverse-geocoding refs
  const reverseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const lastUserEditRef = useRef(false);
  const dropdownSelectionRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastReverseGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);
  const callbacksRef = useRef({ onChange, onSelect, onClear, onLatitudeChange, onLongitudeChange });

  // Keep latest callbacks without re-triggering effects
  useEffect(() => {
    callbacksRef.current = { onChange, onSelect, onClear, onLatitudeChange, onLongitudeChange };
  });

  // Sync coordinate inputs when the parent pushes new lat/long values
  // (e.g. after a dropdown selection or when restoring a saved chart).
  useEffect(() => {
    if (lastUserEditRef.current) return;
    setLatInput(latitude != null ? String(latitude) : "");
    setLngInput(longitude != null ? String(longitude) : "");
  }, [latitude, longitude]);

  // Debounced search (300ms) — only fetch when 2+ characters are typed
  useEffect(() => {
    const query = value.trim();

    // Don't run the forward-search effect while the user is in manual mode
    if (mode !== "search") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setError(null);
      return;
    }

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

      const isPinCode = PIN_CODE_REGEX.test(query);

      // 6-digit PIN code → OpenStreetMap Nominatim (India only)
      const request = isPinCode
        ? fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(query)}&countrycodes=in&format=json&addressdetails=1`,
            { signal: controller.signal }
          )
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch places");
              return res.json();
            })
            .then((data: NominatimResult[]) => {
              return Array.isArray(data) ? data.map(mapNominatimResult) : [];
            })
        // Text/City search → Open-Meteo Geocoding API
        : fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
            { signal: controller.signal }
          )
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch places");
              return res.json();
            })
            .then((data) => {
              return (data?.results ?? []) as GeocodingResult[];
            });

      request
        .then((list) => {
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
  }, [value, mode]);

  // Reverse geocoding (400ms debounce) — Lat/Long → Place
  useEffect(() => {
    const lat = parseCoordinate(latInput);
    const lng = parseCoordinate(lngInput);

    if (lat === null || lng === null) {
      setReverseError(null);
      return;
    }

    if (!isValidLatitude(lat)) {
      setReverseError("Latitude must be between -90 and 90.");
      return;
    }

    if (!isValidLongitude(lng)) {
      setReverseError("Longitude must be between -180 and 180.");
      return;
    }

    // Skip when the coordinates were just populated from a dropdown selection
    const fromDropdown = dropdownSelectionRef.current;
    if (
      fromDropdown &&
      Math.abs(fromDropdown.lat - lat) < 1e-9 &&
      Math.abs(fromDropdown.lng - lng) < 1e-9
    ) {
      return;
    }

    // Skip when we already resolved these exact coordinates
    const already = lastReverseGeocodedRef.current;
    if (already && already.lat === lat && already.lng === lng) {
      return;
    }

    // Only resolve when the user is actively editing the manual fields
    if (!lastUserEditRef.current) return;

    setReverseError(null);
    setIsResolving(true);

    if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    if (reverseAbortRef.current) reverseAbortRef.current.abort();

    reverseDebounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      )
        .then((res) => {
          if (!res.ok) throw new Error("Reverse geocoding failed");
          return res.json() as Promise<ReverseGeocodeResponse>;
        })
        .then((data) => {
          const primary = data?.city || data?.locality || data?.principalSubdivision || "";
          const country = data?.countryName || "";
          const resolvedPlace = [primary, country].filter(Boolean).join(", ");

          const resolvedTimezone = extractTimezone(data);

          lastUserEditRef.current = false;
          lastReverseGeocodedRef.current = { lat, lng };

          if (resolvedPlace) {
            callbacksRef.current.onChange(resolvedPlace);
            callbacksRef.current.onSelect?.({
              placeName: resolvedPlace,
              latitude: lat,
              longitude: lng,
              timezone: resolvedTimezone,
            });
          }
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setReverseError("Couldn't resolve the location. Please verify the coordinates.");
        })
        .finally(() => setIsResolving(false));
    }, 400);

    return () => {
      if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    };
  }, [latInput, lngInput, mode]);

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
      if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
      if (reverseAbortRef.current) reverseAbortRef.current.abort();
    };
  }, []);

  const handleSelect = (place: GeocodingResult) => {
    const formatted = formatPlaceName(place);
    dropdownSelectionRef.current = { lat: place.latitude, lng: place.longitude };
    setLatInput(String(place.latitude));
    setLngInput(String(place.longitude));
    lastUserEditRef.current = false;

    callbacksRef.current.onChange(formatted);
    callbacksRef.current.onSelect?.({
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

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLatInput(raw);
    lastUserEditRef.current = true;
    const num = parseCoordinate(raw);
    callbacksRef.current.onLatitudeChange?.(
      num !== null && isValidLatitude(num) ? num : null
    );
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLngInput(raw);
    lastUserEditRef.current = true;
    const num = parseCoordinate(raw);
    callbacksRef.current.onLongitudeChange?.(
      num !== null && isValidLongitude(num) ? num : null
    );
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "search" ? "coordinates" : "search"));
    setReverseError(null);
  };

  const isSearchMode = mode === "search";

  return (
    <div className="relative" ref={containerRef}>
      {/* ===== Search by Place / PIN Code ===== */}
      {isSearchMode && (
        <>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                callbacksRef.current.onChange(e.target.value);
                callbacksRef.current.onClear?.();
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
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#6B7280] pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-400 dark:text-[#6B7280]">
            Tip: You can search by city name or 6-digit postal PIN code.
          </p>

          {/* OR divider */}
          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-[#6B7280]">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
          </div>

          <button
            type="button"
            onClick={toggleMode}
            aria-expanded={false}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs sm:text-sm font-medium text-violet-700 dark:text-[#FFD166] hover:text-violet-800 dark:hover:text-[#E0A96D] hover:bg-violet-50 dark:hover:bg-white/5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Enter Coordinates Manually
          </button>
        </>
      )}

      {/* ===== Manual Lat / Long ===== */}
      {!isSearchMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleMode}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] hover:text-violet-700 dark:hover:text-[#FFD166] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Search by Place / PIN Code
            </button>
            {value && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9CA3AF]">
                <MapPin className="w-3 h-3" />
                {value}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">
                Latitude (-90 to 90)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={latInput}
                onChange={handleLatChange}
                placeholder="e.g. 28.6139"
                min={-90}
                max={90}
                step="any"
                className="w-full astro-input py-2 px-3 text-xs sm:text-sm"
                aria-label="Latitude"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">
                Longitude (-180 to 180)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={lngInput}
                onChange={handleLngChange}
                placeholder="e.g. 77.2090"
                min={-180}
                max={180}
                step="any"
                className="w-full astro-input py-2 px-3 text-xs sm:text-sm"
                aria-label="Longitude"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Reverse-geocoding status */}
          <div className="min-h-[1.25rem]">
            {isResolving && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9CA3AF]">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                Resolving place name...
              </p>
            )}
            {reverseError && !isResolving && (
              <p className="flex items-center gap-1.5 text-xs text-red-500">
                {reverseError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== Search dropdown ===== */}
      {isSearchMode && isOpen && (
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

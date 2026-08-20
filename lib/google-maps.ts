import type { GoogleMapsAutocomplete, GoogleMapsPlace } from "@/types/google-maps";

/**
 * Google Maps API utilities for location services.
 *
 * This module provides:
 * - Client-side: Dynamic loading of the Google Maps JS API + Places Autocomplete initialization
 * - Server-side: Geocoding API to convert place names to coordinates
 *
 * The API key is read from environment variables:
 * - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (client-side, exposed to browser)
 * - GOOGLE_MAPS_API_KEY (server-side, not exposed to browser)
 */

/** Public API key used by the client-side Places Autocomplete widget. */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/** URL for loading the Google Maps JavaScript API with the Places library. */
export const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

/**
 * Loads the Google Maps JavaScript API script dynamically in the browser.
 *
 * - Resolves immediately if the API is already loaded.
 * - Deduplicates concurrent loads (only one script tag is created).
 * - Rejects if the script fails to load or if called on the server.
 */
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps script can only be loaded in the browser"));
      return;
    }

    // Already loaded
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Script already in the DOM (pending load)
    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_MAPS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

/**
 * Initializes Google Places Autocomplete on an input element.
 *
 * @param inputElement - The text input to attach autocomplete to.
 * @param onPlaceSelect - Callback fired when a place is selected.
 * @returns The Autocomplete instance, or `null` if Google Maps is unavailable.
 */
export function initPlaceAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (place: GoogleMapsPlace) => void
): GoogleMapsAutocomplete | null {
  if (typeof window === "undefined" || !window.google?.maps?.places) {
    return null;
  }

  const autocomplete = new window.google.maps.places.Autocomplete(
    inputElement,
    {
      fields: ["formatted_address", "geometry", "name"],
      types: ["(cities)"],
    }
  );

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      onPlaceSelect({
        address: place.formatted_address || place.name || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  });

  return autocomplete;
}

/**
 * Geocodes a place name to coordinates using the Google Geocoding API.
 *
 * Intended for server-side use (e.g. in Next.js API routes).
 *
 * @param place - A human-readable place name (e.g. "Mumbai, Maharashtra").
 * @returns Coordinates and formatted address, or `null` if geocoding fails.
 */
export async function geocodePlace(
  place: string
): Promise<GoogleMapsPlace & { formattedAddress: string } | null> {
  // Prefer the server-side env var; fall back to the public one.
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("[google-maps] No Google Maps API key found — skipping geocode");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    place
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    console.warn(
      `[google-maps] Geocoding failed for "${place}": ${data.status}`
    );
    return null;
  } catch (error) {
    console.error("[google-maps] Geocoding error:", error);
    return null;
  }
}

/**
 * Minimal type declarations for the Google Maps JavaScript API.
 * Only covers the Places Autocomplete features used in this project.
 */

/** A place returned by the Places Autocomplete widget. */
export interface GoogleMapsPlace {
  address: string;
  lat: number;
  lng: number;
}

/** The Autocomplete instance returned by `initPlaceAutocomplete`. */
export interface GoogleMapsAutocomplete {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    name?: string;
    geometry?: {
      location: {
        lat: () => number;
        lng: () => number;
      };
    };
  };
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              fields?: string[];
              types?: string[];
            }
          ) => GoogleMapsAutocomplete;
        };
      };
    };
  }
}

export {};

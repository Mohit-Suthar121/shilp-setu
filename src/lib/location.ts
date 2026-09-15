/**
 * Geolocation and reverse-geocoding utility for artisans across India.
 * Uses browser Geolocation + OpenStreetMap Nominatim reverse geocoding.
 */

export type ArtisanLocation = {
  villageOrTown: string;
  district?: string;
  state?: string;
  country?: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source: "gps" | "preset" | "ip";
};

export const ARTISAN_CLUSTERS: { name: string; state: string; craft: string }[] = [
  { name: "Kot Jewar, Jaipur", state: "Rajasthan", craft: "Blue Pottery" },
  { name: "Panchmura, Bankura", state: "West Bengal", craft: "Terracotta" },
  { name: "Madhubani, Darbhanga", state: "Bihar", craft: "Madhubani Painting" },
  { name: "Bishnupur", state: "West Bengal", craft: "Dokra & Terracotta" },
  { name: "Bhuj, Kutch", state: "Gujarat", craft: "Block Print & Ajrakh" },
  { name: "Varanasi", state: "Uttar Pradesh", craft: "Banarasi Silk & Woodcraft" },
  { name: "Raghurajpur, Puri", state: "Odisha", craft: "Pattachitra" },
  { name: "Kondapalli, Krishna", state: "Andhra Pradesh", craft: "Wooden Toys" },
];

/**
 * Reverse geocodes coordinates using OpenStreetMap Nominatim API.
 * Gracefully extracts village, town, hamlet, or city name.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ArtisanLocation> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "en,hi",
        "User-Agent": "ShilpSetu-Artisan-App/1.0",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const localName =
      address.village ||
      address.hamlet ||
      address.town ||
      address.suburb ||
      address.neighbourhood ||
      address.city ||
      address.county ||
      "Artisan Cluster";

    const district = address.state_district || address.county || address.district || "";
    const state = address.state || "";
    const country = address.country || "India";

    // Build a readable Indian artisan location string: "Village/Town, District, State"
    const parts = [localName];
    if (district && district.toLowerCase() !== localName.toLowerCase()) {
      parts.push(district);
    }
    if (state) {
      parts.push(state);
    }

    const displayName = parts.join(", ");

    return {
      villageOrTown: localName,
      district,
      state,
      country,
      displayName,
      latitude,
      longitude,
      source: "gps",
    };
  } catch {
    // If reverse geocode fails (offline, rate-limited, etc.), fallback to coordinates format
    return {
      villageOrTown: `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      displayName: `Loc: ${latitude.toFixed(3)}N, ${longitude.toFixed(3)}E`,
      latitude,
      longitude,
      source: "gps",
    };
  }
}

/**
 * Detects artisan's actual current location via browser Geolocation.
 */
export function detectArtisanLocation(options?: { timeoutMs?: number }): Promise<ArtisanLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by your device or browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        let msg = "Could not get current location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access was denied. Please allow location permissions in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS position is unavailable. Please check your device location settings.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: options?.timeoutMs ?? 10000,
        maximumAge: 60000,
      },
    );
  });
}

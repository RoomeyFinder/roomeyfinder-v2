export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationSelection = Coordinates & {
  label: string;
  providerId?: string;
};

export function isValidCoordinates({ latitude, longitude }: Coordinates) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function toPostgisPoint(location: Coordinates) {
  if (!isValidCoordinates(location)) {
    throw new Error("Invalid location coordinates.");
  }

  // PostGIS expects longitude first, followed by latitude.
  return `SRID=4326;POINT(${location.longitude} ${location.latitude})`;
}

export function fromPostgisPoint(value: unknown): Coordinates | null {
  if (value && typeof value === "object" && "coordinates" in value) {
    const coordinates = (value as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const longitude = Number(coordinates[0]);
      const latitude = Number(coordinates[1]);
      return isValidCoordinates({ latitude, longitude }) ? { latitude, longitude } : null;
    }
  }

  if (typeof value === "string") {
    const match = value.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
    if (match) {
      const longitude = Number(match[1]);
      const latitude = Number(match[2]);
      return isValidCoordinates({ latitude, longitude }) ? { latitude, longitude } : null;
    }

    if (/^[0-9a-f]+$/i.test(value) && value.length >= 50) {
      try {
        const bytes = new Uint8Array(value.match(/../g)!.map((pair) => Number.parseInt(pair, 16)));
        const view = new DataView(bytes.buffer);
        const littleEndian = bytes[0] === 1;
        const type = view.getUint32(1, littleEndian);
        const offset = (type & 0x20000000) !== 0 ? 9 : 5;
        if ((type & 0xff) === 1) {
          const longitude = view.getFloat64(offset, littleEndian);
          const latitude = view.getFloat64(offset + 8, littleEndian);
          return isValidCoordinates({ latitude, longitude }) ? { latitude, longitude } : null;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function requestCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is not available in this browser."));
      return;
    }

    const hostname = window.location.hostname;
    const localHost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!window.isSecureContext && !localHost) {
      reject(new Error("Current location requires HTTPS or localhost."));
      return;
    }

    function handleSuccess({ coords }: GeolocationPosition) {
      const location = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      if (!isValidCoordinates(location)) {
        reject(new Error("The browser returned invalid location coordinates."));
        return;
      }

      resolve(location);
    }

    let retried = false;
    function handleError(error: GeolocationPositionError) {
      // Some phones first report that a coarse fix is unavailable while the
      // GPS radio is still starting. Give a higher-accuracy request one try.
      if (
        !retried &&
        (error.code === GeolocationPositionError.POSITION_UNAVAILABLE ||
          error.code === GeolocationPositionError.TIMEOUT)
      ) {
        retried = true;
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
        return;
      }

      const message =
        error.code === GeolocationPositionError.PERMISSION_DENIED
          ? "Location permission was denied. Allow it in your browser or site settings, then try again."
          : error.code === GeolocationPositionError.POSITION_UNAVAILABLE
            ? "Your device could not determine a location. Turn on device location services and try again."
            : error.code === GeolocationPositionError.TIMEOUT
              ? "Finding your location timed out. Check your signal or Wi-Fi and try again."
              : "Unable to determine your current location.";

      reject(new Error(message));
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000,
    });
  });
}

export async function searchLocations(query: string, signal?: AbortSignal) {
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
    signal,
  });

  const payload = (await response.json()) as {
    locations?: LocationSelection[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to search for that location.");
  }

  return payload.locations ?? [];
}

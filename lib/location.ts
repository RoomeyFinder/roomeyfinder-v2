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
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
        );
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

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
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

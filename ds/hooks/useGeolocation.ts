"use client";
import { useEffect, useState } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GeolocationState {
  loading: boolean;
  position: GeoPosition | null;
  error: GeolocationPositionError | Error | null;
  supported: boolean;
}

export interface UseGeolocationOptions extends PositionOptions {
  /** watchPosition 사용 (지속 추적) */
  watch?: boolean;
}

/**
 * 브라우저 Geolocation API 래퍼 (1회 조회 또는 watch).
 * @example
 * const { position, error, loading } = useGeolocation({ watch: true });
 */
export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationState {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [state, setState] = useState<GeolocationState>({
    loading: supported,
    position: null,
    error: null,
    supported,
  });

  useEffect(() => {
    if (!supported) {
      setState((s) => ({ ...s, loading: false, error: new Error("Geolocation not supported") }));
      return;
    }

    const onSuccess = (p: GeolocationPosition) => {
      const c = p.coords;
      setState({
        loading: false,
        position: {
          lat: c.latitude,
          lng: c.longitude,
          accuracy: c.accuracy,
          altitude: c.altitude,
          altitudeAccuracy: c.altitudeAccuracy,
          heading: c.heading,
          speed: c.speed,
          timestamp: p.timestamp,
        },
        error: null,
        supported: true,
      });
    };
    const onError = (err: GeolocationPositionError) => {
      setState({ loading: false, position: null, error: err, supported: true });
    };

    const { watch, ...posOptions } = options;
    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, posOptions);
      return () => navigator.geolocation.clearWatch(id);
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, posOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.watch, options.enableHighAccuracy, options.maximumAge, options.timeout]);

  return state;
}

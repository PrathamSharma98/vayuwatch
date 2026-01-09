import { useState, useCallback } from 'react';
import { getAllCities, City, getAQICategory } from '@/data/pollutionData';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  permissionDenied: boolean;
}

interface NearestStation {
  city: City;
  distance: number; // in km
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
    permissionDenied: false,
  });

  const [nearestStation, setNearestStation] = useState<NearestStation | null>(null);

  const findNearestStation = useCallback((lat: number, lon: number) => {
    const cities = getAllCities();
    let nearest: NearestStation | null = null;
    let minDistance = Infinity;

    cities.forEach(city => {
      // City coordinates are [longitude, latitude]
      const distance = calculateDistance(lat, lon, city.coordinates[1], city.coordinates[0]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { city, distance: Math.round(distance * 10) / 10 };
      }
    });

    setNearestStation(nearest);
    return nearest;
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          error: null,
          isLoading: false,
          permissionDenied: false,
        });
        findNearestStation(latitude, longitude);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocation({
          latitude: null,
          longitude: null,
          error: errorMessage,
          isLoading: false,
          permissionDenied,
        });

        // If permission denied, set Delhi as default for demo
        if (permissionDenied) {
          findNearestStation(28.6139, 77.2090);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [findNearestStation]);

  const setManualLocation = useCallback((cityId: string) => {
    const cities = getAllCities();
    const city = cities.find(c => c.id === cityId);
    if (city) {
      setLocation({
        latitude: city.coordinates[1],
        longitude: city.coordinates[0],
        error: null,
        isLoading: false,
        permissionDenied: false,
      });
      setNearestStation({ city, distance: 0 });
    }
  }, []);

  return {
    ...location,
    nearestStation,
    requestLocation,
    setManualLocation,
  };
}

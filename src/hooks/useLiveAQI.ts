import { useState, useEffect, useCallback } from 'react';
import { 
  statesData, 
  State, 
  City, 
  Ward, 
  AQICategory, 
  getAQICategory,
  PollutantData 
} from '@/data/pollutionData';

// Simulated live data with realistic variations
interface LiveAQIData {
  states: State[];
  lastUpdated: Date;
  isSimulated: boolean;
}

// Apply realistic variation to AQI values
function applyVariation(baseAqi: number, maxVariation: number = 15): number {
  const variation = (Math.random() - 0.5) * 2 * maxVariation;
  const newAqi = Math.round(baseAqi + variation);
  return Math.max(0, Math.min(500, newAqi)); // Keep within valid AQI range
}

// Apply variation to pollutant data
function applyPollutantVariation(pollutants: PollutantData): PollutantData {
  return {
    pm25: Math.max(0, Math.round(pollutants.pm25 * (0.9 + Math.random() * 0.2))),
    pm10: Math.max(0, Math.round(pollutants.pm10 * (0.9 + Math.random() * 0.2))),
    no2: Math.max(0, Math.round(pollutants.no2 * (0.85 + Math.random() * 0.3))),
    so2: Math.max(0, Math.round(pollutants.so2 * (0.85 + Math.random() * 0.3))),
    co: Math.max(0, Number((pollutants.co * (0.9 + Math.random() * 0.2)).toFixed(1))),
    o3: Math.max(0, Math.round(pollutants.o3 * (0.85 + Math.random() * 0.3))),
    nh3: pollutants.nh3 ? Math.max(0, Math.round(pollutants.nh3 * (0.85 + Math.random() * 0.3))) : undefined,
    pb: pollutants.pb,
  };
}

// Generate live data with variations
function generateLiveData(): State[] {
  return statesData.map(state => {
    const updatedCities = state.cities.map(city => {
      const cityAqi = applyVariation(city.aqi, 20);
      const updatedWards = city.wards.map(ward => {
        const wardAqi = applyVariation(ward.aqi, 15);
        return {
          ...ward,
          aqi: wardAqi,
          category: getAQICategory(wardAqi),
          pollutants: applyPollutantVariation(ward.pollutants),
        };
      });

      return {
        ...city,
        aqi: cityAqi,
        category: getAQICategory(cityAqi),
        pollutants: applyPollutantVariation(city.pollutants),
        wards: updatedWards,
        lastUpdated: new Date().toISOString(),
      };
    });

    // Recalculate state AQI as average of cities
    const stateAqi = Math.round(
      updatedCities.reduce((sum, city) => sum + city.aqi, 0) / updatedCities.length
    );

    return {
      ...state,
      aqi: stateAqi,
      category: getAQICategory(stateAqi),
      cities: updatedCities,
    };
  });
}

export function useLiveAQI(refreshInterval: number = 180000) { // Default 3 minutes
  const [data, setData] = useState<LiveAQIData>({
    states: statesData,
    lastUpdated: new Date(),
    isSimulated: true,
  });

  const refresh = useCallback(() => {
    setData({
      states: generateLiveData(),
      lastUpdated: new Date(),
      isSimulated: true,
    });
  }, []);

  useEffect(() => {
    // Initial update
    refresh();

    // Set up interval for live updates
    const interval = setInterval(refresh, refreshInterval);

    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  // Helper functions that work with live data
  const getAllCitiesLive = useCallback((): City[] => {
    return data.states.flatMap(state => state.cities);
  }, [data.states]);

  const getCityByIdLive = useCallback((cityId: string): City | undefined => {
    return getAllCitiesLive().find(city => city.id === cityId);
  }, [getAllCitiesLive]);

  const getStateByIdLive = useCallback((stateId: string): State | undefined => {
    return data.states.find(state => state.id === stateId);
  }, [data.states]);

  const getTopPollutedCitiesLive = useCallback((limit: number = 10): City[] => {
    return getAllCitiesLive()
      .sort((a, b) => b.aqi - a.aqi)
      .slice(0, limit);
  }, [getAllCitiesLive]);

  const getNationalStatsLive = useCallback(() => {
    const allCities = getAllCitiesLive();
    const totalAqi = allCities.reduce((sum, city) => sum + city.aqi, 0);
    const avgAqi = Math.round(totalAqi / allCities.length);
    
    const categoryCounts = allCities.reduce((acc, city) => {
      acc[city.category] = (acc[city.category] || 0) + 1;
      return acc;
    }, {} as Record<AQICategory, number>);

    return {
      averageAqi: avgAqi,
      category: getAQICategory(avgAqi),
      totalCities: allCities.length,
      totalStates: data.states.length,
      categoryCounts,
      worstCity: allCities.reduce((worst, city) => city.aqi > worst.aqi ? city : worst),
      bestCity: allCities.reduce((best, city) => city.aqi < best.aqi ? city : best),
    };
  }, [getAllCitiesLive, data.states.length]);

  return {
    states: data.states,
    lastUpdated: data.lastUpdated,
    isSimulated: data.isSimulated,
    refresh,
    getAllCities: getAllCitiesLive,
    getCityById: getCityByIdLive,
    getStateById: getStateByIdLive,
    getTopPollutedCities: getTopPollutedCitiesLive,
    getNationalStats: getNationalStatsLive,
  };
}

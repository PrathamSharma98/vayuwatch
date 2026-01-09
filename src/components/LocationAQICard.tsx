import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { AQIGauge } from '@/components/AQIGauge';
import { AQIBadge } from '@/components/AQIBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllCities, getAQILabel, getHealthAdvisory } from '@/data/pollutionData';
import { cn } from '@/lib/utils';

interface LocationAQICardProps {
  onCityClick?: (cityId: string) => void;
  className?: string;
}

export function LocationAQICard({ onCityClick, className }: LocationAQICardProps) {
  const {
    latitude,
    longitude,
    error,
    isLoading,
    permissionDenied,
    nearestStation,
    requestLocation,
    setManualLocation,
  } = useGeolocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof getAllCities>>([]);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Search cities
  useEffect(() => {
    if (searchQuery.trim()) {
      const cities = getAllCities();
      const results = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectCity = (cityId: string) => {
    setManualLocation(cityId);
    setShowSearch(false);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-6 rounded-xl bg-card border border-border/50',
          className
        )}
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-muted-foreground">Detecting your location...</p>
        </div>
      </motion.div>
    );
  }

  if (!nearestStation && (permissionDenied || error)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-6 rounded-xl bg-card border border-border/50',
          className
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Your Location AQI</h3>
        </div>

        <div className="text-center py-4">
          <AlertCircle className="w-10 h-10 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {permissionDenied 
              ? 'Location access was denied. Search for your city instead.'
              : error || 'Unable to detect location.'
            }
          </p>

          {/* Manual Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-foreground">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.state}</p>
                    </div>
                    <AQIBadge category={city.category} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!nearestStation) return null;

  const { city, distance } = nearestStation;
  const advisory = getHealthAdvisory(city.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-xl bg-card border border-border/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Your Location</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={requestLocation}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSearch(!showSearch)}
            className="text-xs"
          >
            <Search className="w-3 h-3 mr-1" />
            Change
          </Button>
        </div>
      </div>

      {/* Search (toggle) */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCity(c.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.state}</p>
                    </div>
                    <AQIBadge category={c.category} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Location Info */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <button
            onClick={() => onCityClick?.(city.id)}
            className="text-left group"
          >
            <h4 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
              {city.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {city.state} • {distance} km away
            </p>
          </button>

          <div className="mt-3">
            <AQIBadge category={city.category} />
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Health: </span>
              {advisory.general}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Outdoor: </span>
              {advisory.outdoor}
            </p>
          </div>
        </div>

        <AQIGauge
          value={city.aqi}
          category={city.category}
          size="md"
        />
      </div>

      {/* Quick Pollutant Stats */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{city.pollutants.pm25}</p>
          <p className="text-xs text-muted-foreground">PM2.5 µg/m³</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{city.pollutants.pm10}</p>
          <p className="text-xs text-muted-foreground">PM10 µg/m³</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{city.pollutants.no2}</p>
          <p className="text-xs text-muted-foreground">NO₂ µg/m³</p>
        </div>
      </div>
    </motion.div>
  );
}

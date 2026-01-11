import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ChevronDown, ChevronUp, Leaf } from 'lucide-react';
import { AQICategory, getAQIColor } from '@/data/pollutionData';
import { getCleanAirSuggestions, CleanAirSuggestion } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AQIBadge } from '@/components/AQIBadge';

interface CleanAirEscapeCardProps {
  currentAQI: number;
  currentLocation: string;
  nearbyLocations: { name: string; aqi: number; category: AQICategory }[];
  onLocationClick?: (location: string) => void;
  className?: string;
}

export function CleanAirEscapeCard({
  currentAQI,
  currentLocation,
  nearbyLocations,
  onLocationClick,
  className
}: CleanAirEscapeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const suggestions = useMemo(() => 
    getCleanAirSuggestions(currentAQI, nearbyLocations),
    [currentAQI, nearbyLocations]
  );

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-card border border-border/50 overflow-hidden', className)}
    >
      <Button
        variant="ghost"
        className="w-full p-4 flex items-center justify-between h-auto hover:bg-secondary/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-aqi-good/10">
            <Leaf className="w-5 h-5 text-aqi-good" />
          </div>
          <div className="text-left">
            <div className="font-display font-semibold text-foreground">Find Cleaner Air</div>
            <div className="text-xs text-muted-foreground">
              {suggestions.length} nearby areas with better air quality
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onLocationClick?.(suggestion.name)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getAQIColor(suggestion.category) }}
                    >
                      {suggestion.currentAQI}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{suggestion.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {suggestion.distance}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-aqi-good">
                      -{suggestion.improvement} AQI
                    </div>
                    <AQIBadge category={suggestion.category} size="sm" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

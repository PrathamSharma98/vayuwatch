import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { IndiaMap } from '@/components/IndiaMap';
import { AQIBadge } from '@/components/AQIBadge';
import { allIndiaStates } from '@/data/indiaStatesData';
import { State, City } from '@/data/pollutionData';
import { useNavigate } from 'react-router-dom';

const MapView = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<State | null>(null);

  const handleStateClick = (state: State | null) => {
    setSelectedState(state);
  };

  const handleCityClick = (city: City) => {
    navigate(`/city/${city.id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              India AQI Map
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Interactive map showing real-time air quality across 28 States and 8 Union Territories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="xl:col-span-9 widget-card overflow-hidden"
          >
            <IndiaMap
              onStateClick={handleStateClick}
              onCityClick={handleCityClick}
              selectedStateId={selectedState?.id}
              className="h-[500px] xl:h-[650px]"
            />
          </motion.div>

          {/* State/City List */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-3 widget-card h-fit"
          >
            <div className="px-4 py-3 border-b border-border/40">
              <h2 className="font-display font-semibold text-sm text-foreground">
                {selectedState ? `${selectedState.name} Cities` : 'States & UTs'}
              </h2>
            </div>
            
            <div className="p-3 space-y-1.5 max-h-[550px] overflow-y-auto scrollbar-thin">
              {selectedState ? (
                // Show cities
                selectedState.cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => navigate(`/city/${city.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors text-left group"
                  >
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{city.name}</span>
                    <AQIBadge category={city.category} size="sm" />
                  </button>
                ))
              ) : (
                // Show states
                allIndiaStates.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => handleStateClick(state)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors block truncate">{state.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {state.cities.length} cities
                      </span>
                    </div>
                    <AQIBadge category={state.category} size="sm" />
                  </button>
                ))
              )}
            </div>
            
            {selectedState && (
              <div className="p-3 border-t border-border/40">
                <button
                  onClick={() => setSelectedState(null)}
                  className="w-full p-2 rounded-md border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  ← Back to all states
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapView;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Building2,
  ThermometerSun
} from 'lucide-react';
import { Header } from '@/components/Header';
import { IndiaMap } from '@/components/IndiaMap';
import { AQIGauge } from '@/components/AQIGauge';
import { CityCard } from '@/components/CityCard';
import { StatCard } from '@/components/StatCard';
import { AQIScaleLegend } from '@/components/AQIScaleLegend';
import { SourceBreakdown } from '@/components/SourceBreakdown';
import { LiveIndicator } from '@/components/LiveIndicator';
import { AQIBadge } from '@/components/AQIBadge';
import { LocationAQICard } from '@/components/LocationAQICard';
import { LiveSimulatedBadge } from '@/components/LiveSimulatedBadge';
import { useLiveAQI } from '@/hooks/useLiveAQI';
import { useAuth } from '@/contexts/AuthContext';
import { State, City } from '@/data/pollutionData';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const { isAuthenticated } = useAuth();
  const { states, lastUpdated, getNationalStats, getTopPollutedCities } = useLiveAQI();
  const nationalStats = getNationalStats();
  const topPollutedCities = getTopPollutedCities(5);

  const handleStateClick = (state: State | null) => {
    setSelectedState(state);
  };

  const handleCityClick = (city: City) => {
    navigate(`/city/${city.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-warning text-warning-foreground">DEMO MODE</Badge>
            <span className="text-sm text-warning">Beta Version 1.0 – Data is simulated for demonstration</span>
          </div>
          <LiveSimulatedBadge lastUpdated={lastUpdated} />
        </motion.div>

        {/* Location-based AQI Card (shown after login) */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <LocationAQICard onCityClick={(cityId) => navigate(`/city/${cityId}`)} />
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                  India Air Quality
                </h1>
                <LiveIndicator />
              </div>
              <p className="text-muted-foreground">
                Real-time pollution monitoring across {nationalStats.totalStates} states and {nationalStats.totalCities} cities
              </p>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
              <AQIGauge 
                value={nationalStats.averageAqi} 
                category={nationalStats.category}
                size="sm"
                showLabel={false}
              />
              <div>
                <p className="text-sm text-muted-foreground">National Average</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-foreground">
                    {nationalStats.averageAqi}
                  </span>
                  <AQIBadge category={nationalStats.category} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Worst City"
              value={nationalStats.worstCity.name}
              subtitle={`AQI ${nationalStats.worstCity.aqi}`}
              icon={AlertTriangle}
              delay={0.1}
            />
            <StatCard
              title="Best City"
              value={nationalStats.bestCity.name}
              subtitle={`AQI ${nationalStats.bestCity.aqi}`}
              icon={ThermometerSun}
              delay={0.2}
            />
            <StatCard
              title="Monitoring Stations"
              value="180+"
              subtitle="CPCB & SPCB stations"
              icon={Activity}
              delay={0.3}
            />
            <StatCard
              title="States Covered"
              value={nationalStats.totalStates}
              subtitle="Real-time data"
              icon={Building2}
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="font-display font-semibold text-foreground">
                      {selectedState ? `${selectedState.name} - City View` : 'India AQI Heatmap'}
                    </h2>
                  </div>
                  {selectedState && (
                    <AQIBadge category={selectedState.category} />
                  )}
                </div>
              </div>
              <IndiaMap
                onStateClick={handleStateClick}
                onCityClick={handleCityClick}
                selectedStateId={selectedState?.id}
                className="h-[400px] lg:h-[500px]"
              />
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Top Polluted Cities */}
            <div className="rounded-xl bg-card border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-danger" />
                <h2 className="font-display font-semibold text-foreground">
                  Most Polluted Cities
                </h2>
              </div>
              <div className="space-y-3">
                {topPollutedCities.map((city, index) => (
                  <CityCard 
                    key={city.id} 
                    city={city} 
                    rank={index + 1}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* AQI Scale Legend */}
            <AQIScaleLegend />
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* State-wise Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl bg-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">State-wise AQI</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {states.slice(0, 8).map((state, index) => (
                <motion.button
                  key={state.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleStateClick(state)}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{state.name}</p>
                    <p className="text-xs text-muted-foreground">{state.cities.length} cities</p>
                  </div>
                  <AQIBadge category={state.category} size="sm" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Pollution Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl bg-card border border-border/50 p-6"
          >
            <SourceBreakdown />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <span>VayuWatch - India Air Quality Monitoring System</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Data Source: CPCB</span>
              <span>•</span>
              <span>Standards: NCAP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

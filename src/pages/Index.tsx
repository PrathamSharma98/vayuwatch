import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Building2,
  TrendingDown,
  Users,
  Gauge
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { IndiaMap } from '@/components/IndiaMap';
import { AQIGauge } from '@/components/AQIGauge';
import { CityCard } from '@/components/CityCard';
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
import { cn } from '@/lib/utils';

// Compact metric widget
function MetricWidget({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  className 
}: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  icon: any;
  trend?: 'up' | 'down';
  className?: string;
}) {
  return (
    <div className={cn("widget-card p-4", className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-md bg-secondary/50">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend === 'up' ? "text-danger" : "text-success"
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {subValue && (
        <p className="text-xs text-primary font-medium mt-1">{subValue}</p>
      )}
    </div>
  );
}

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
    <DashboardLayout>
      <div className="p-6">
        {/* Demo Mode Banner - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between py-2 px-3 rounded-md bg-accent/5 border border-accent/15"
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-accent/20 text-accent border-0 text-[10px] px-1.5 py-0">DEMO</Badge>
            <span className="text-xs text-muted-foreground">Beta Version 1.0 – Simulated data</span>
          </div>
          <LiveSimulatedBadge lastUpdated={lastUpdated} />
        </motion.div>

        {/* Location-based AQI Card (shown after login) */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <LocationAQICard onCityClick={(cityId) => navigate(`/city/${cityId}`)} />
          </motion.div>
        )}

        {/* Header Row - Compact and Data-Focused */}
        <div className="flex flex-col xl:flex-row xl:items-start gap-5 mb-6">
          {/* Left: Title + National AQI */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                National Overview
              </h1>
              <LiveIndicator />
            </div>
            <p className="text-sm text-muted-foreground">
              Monitoring {nationalStats.totalCities} cities across {nationalStats.totalStates} states
            </p>
          </div>

          {/* Right: National AQI Widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="widget-card p-4 flex items-center gap-4"
          >
            <AQIGauge 
              value={nationalStats.averageAqi} 
              category={nationalStats.category}
              size="sm"
              showLabel={false}
            />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">National Average</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-bold text-foreground font-mono tracking-tight">
                  {nationalStats.averageAqi}
                </span>
                <AQIBadge category={nationalStats.category} size="sm" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Row - Asymmetric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricWidget
            label="Worst City Today"
            value={nationalStats.worstCity.name}
            subValue={`AQI ${nationalStats.worstCity.aqi}`}
            icon={AlertTriangle}
            trend="up"
          />
          <MetricWidget
            label="Cleanest City"
            value={nationalStats.bestCity.name}
            subValue={`AQI ${nationalStats.bestCity.aqi}`}
            icon={Wind}
            trend="down"
          />
          <MetricWidget
            label="Active Stations"
            value="180+"
            subValue="CPCB & SPCB"
            icon={Activity}
          />
          <MetricWidget
            label="States Covered"
            value={nationalStats.totalStates}
            subValue="Real-time data"
            icon={Building2}
          />
        </div>

        {/* Main Content - Asymmetric Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Map Section - Takes more space */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-8"
          >
            <div className="widget-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-sm text-foreground">
                    {selectedState ? `${selectedState.name} - Cities` : 'India AQI Heatmap'}
                  </h2>
                </div>
                {selectedState && (
                  <AQIBadge category={selectedState.category} size="sm" />
                )}
              </div>
              <IndiaMap
                onStateClick={handleStateClick}
                onCityClick={handleCityClick}
                selectedStateId={selectedState?.id}
                className="h-[420px]"
              />
            </div>
          </motion.div>

          {/* Sidebar Widgets */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="xl:col-span-4 space-y-4"
          >
            {/* Top Polluted Cities */}
            <div className="widget-card">
              <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-danger" />
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Most Polluted
                </h2>
              </div>
              <div className="p-3 space-y-2">
                {topPollutedCities.map((city, index) => (
                  <CityCard 
                    key={city.id} 
                    city={city} 
                    rank={index + 1}
                    delay={index * 0.05}
                  />
                ))}
              </div>
            </div>

            {/* AQI Scale Legend - Compact */}
            <AQIScaleLegend />
          </motion.div>
        </div>

        {/* Bottom Section - State Grid + Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          {/* State-wise Summary - Larger */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 widget-card"
          >
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">State Overview</h2>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {states.slice(0, 9).map((state, index) => (
                <motion.button
                  key={state.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => handleStateClick(state)}
                  className="flex items-center justify-between p-2.5 rounded-md bg-secondary/20 border border-border/30 hover:border-primary/30 hover:bg-secondary/40 transition-all text-left group"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {state.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{state.cities.length} cities</p>
                  </div>
                  <AQIBadge category={state.category} size="sm" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Pollution Sources */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-5 widget-card p-4"
          >
            <SourceBreakdown />
          </motion.div>
        </div>

        {/* Footer - Minimal */}
        <footer className="mt-8 pt-4 border-t border-border/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-primary" />
              <span>VayuWatch • India Air Quality Monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Data: CPCB</span>
              <span className="text-border">•</span>
              <span>Standards: NCAP</span>
            </div>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Index;
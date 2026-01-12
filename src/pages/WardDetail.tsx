import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Ruler,
  Wind,
  Factory,
  TreePine,
  Car,
  Bus,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AQIGauge } from '@/components/AQIGauge';
import { AQIBadge } from '@/components/AQIBadge';
import { PollutantCard } from '@/components/PollutantCard';
import { HealthAdvisoryCard } from '@/components/HealthAdvisoryCard';
import { LiveIndicator } from '@/components/LiveIndicator';
import { getWardById, getAQIColor } from '@/data/pollutionData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WardDetail = () => {
  const { wardId } = useParams<{ wardId: string }>();
  const navigate = useNavigate();
  const result = getWardById(wardId || '');

  if (!result) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-20">
          <h1 className="text-xl font-display font-bold text-foreground mb-3">Ward Not Found</h1>
          <p className="text-sm text-muted-foreground mb-5">The ward you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} size="sm">Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const { ward, city, state } = result;
  const color = getAQIColor(ward.category);

  const pollutantLimits = {
    pm25: 60,
    pm10: 100,
    no2: 80,
    so2: 80,
    co: 4,
    o3: 180,
  };

  const getRecommendations = () => {
    const baseRecs = [
      { icon: TreePine, text: 'Plant more trees and create green buffers along roads' },
      { icon: Bus, text: 'Use public transport or carpool to reduce vehicular emissions' },
      { icon: Lightbulb, text: 'Switch to LED lights and energy-efficient appliances' },
    ];

    switch (ward.dominantSource) {
      case 'Vehicular':
        return [
          { icon: Car, text: 'Consider odd-even traffic measures during peak pollution' },
          { icon: Bus, text: 'Promote metro/bus usage with subsidized passes' },
          ...baseRecs,
        ];
      case 'Industrial':
        return [
          { icon: Factory, text: 'Ensure industrial units comply with emission norms' },
          { icon: Wind, text: 'Install proper air filtration systems in factories' },
          ...baseRecs,
        ];
      case 'Construction':
        return [
          { icon: Factory, text: 'Mandate dust barriers and water sprinkling at sites' },
          { icon: Wind, text: 'Use covered trucks for transporting construction material' },
          ...baseRecs,
        ];
      default:
        return baseRecs;
    }
  };

  const recommendations = getRecommendations();

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/city/${city.id}`} className="hover:text-primary transition-colors">{city.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{ward.name}</span>
        </div>

        {/* Ward Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-start gap-5 mb-6"
        >
          <div className="flex items-start gap-3 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-8 w-8 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                  {ward.name}
                </h1>
                <LiveIndicator />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.name}, {state.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{(ward.population / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{ward.area} sq km</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="widget-card p-4 flex items-center gap-4"
          >
            <AQIGauge 
              value={ward.aqi} 
              category={ward.category}
              size="sm"
            />
            <div className="space-y-1.5">
              <AQIBadge category={ward.category} size="sm" />
              <p className="text-xs text-muted-foreground">
                Source: {ward.dominantSource}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left Column */}
          <div className="xl:col-span-8 space-y-5">
            {/* Pollutant Cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="widget-card p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">Air Pollutants</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <PollutantCard name="PM2.5" value={ward.pollutants.pm25} unit="µg/m³" limit={pollutantLimits.pm25} />
                <PollutantCard name="PM10" value={ward.pollutants.pm10} unit="µg/m³" limit={pollutantLimits.pm10} />
                <PollutantCard name="NO₂" value={ward.pollutants.no2} unit="µg/m³" limit={pollutantLimits.no2} />
                <PollutantCard name="SO₂" value={ward.pollutants.so2} unit="µg/m³" limit={pollutantLimits.so2} />
                <PollutantCard name="CO" value={ward.pollutants.co} unit="mg/m³" limit={pollutantLimits.co} />
                <PollutantCard name="O₃" value={ward.pollutants.o3} unit="µg/m³" limit={pollutantLimits.o3} />
              </div>
            </motion.div>

            {/* Dominant Pollution Source */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="widget-card p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">Dominant Pollution Source</h2>
              </div>
              <div 
                className="p-3 rounded-md border border-dashed"
                style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-md"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {ward.dominantSource === 'Vehicular' && <Car className="w-5 h-5" style={{ color }} />}
                    {ward.dominantSource === 'Industrial' && <Factory className="w-5 h-5" style={{ color }} />}
                    {ward.dominantSource === 'Construction' && <Factory className="w-5 h-5" style={{ color }} />}
                    {!['Vehicular', 'Industrial', 'Construction'].includes(ward.dominantSource) && (
                      <Wind className="w-5 h-5" style={{ color }} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      {ward.dominantSource}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Primary contributor to local air pollution
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="widget-card p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">Recommended Actions</h2>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-start gap-2.5 p-2.5 rounded-md bg-secondary/20"
                    >
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-xs text-foreground">{rec.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-4">
            {/* Health Advisory */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HealthAdvisoryCard category={ward.category} />
            </motion.div>

            {/* Comparison with City */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="widget-card p-4"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">City Comparison</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{ward.name}</span>
                  <span className="text-base font-bold font-mono" style={{ color: getAQIColor(ward.category) }}>
                    {ward.aqi}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: getAQIColor(ward.category) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((ward.aqi / 500) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{city.name} Avg</span>
                  <span className="text-base font-bold font-mono" style={{ color: getAQIColor(city.category) }}>
                    {city.aqi}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: getAQIColor(city.category) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((city.aqi / 500) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
                
                <div className={cn(
                  'text-xs p-2.5 rounded-md',
                  ward.aqi > city.aqi ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                )}>
                  {ward.aqi > city.aqi 
                    ? `${Math.round(((ward.aqi - city.aqi) / city.aqi) * 100)}% worse than city average`
                    : `${Math.round(((city.aqi - ward.aqi) / city.aqi) * 100)}% better than city average`
                  }
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="widget-card p-4"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick Links</h3>
              <div className="space-y-1.5">
                <Link 
                  to={`/city/${city.id}`}
                  className="block p-2.5 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors text-xs text-foreground"
                >
                  View all {city.name} wards →
                </Link>
                <Link 
                  to="/"
                  className="block p-2.5 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors text-xs text-foreground"
                >
                  Back to national dashboard →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WardDetail;
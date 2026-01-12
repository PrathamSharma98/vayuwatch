import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Activity,
  Clock,
  Wind,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AQIGauge } from '@/components/AQIGauge';
import { AQIBadge } from '@/components/AQIBadge';
import { WardCard } from '@/components/WardCard';
import { PollutantCard } from '@/components/PollutantCard';
import { HealthAdvisoryCard } from '@/components/HealthAdvisoryCard';
import { GRAPActions } from '@/components/GRAPActions';
import { AQITrendChart } from '@/components/AQITrendChart';
import { SourceBreakdown } from '@/components/SourceBreakdown';
import { LiveIndicator } from '@/components/LiveIndicator';
import { DailyLifeImpactCard } from '@/components/DailyLifeImpactCard';
import { AQIChangePanel } from '@/components/AQIChangePanel';
import { RiskIndexCard } from '@/components/RiskIndexCard';
import { VulnerableImpactCard } from '@/components/VulnerableImpactCard';
import { SafetyChecklistCard } from '@/components/SafetyChecklistCard';
import { AuthorityAdvisoryCard } from '@/components/AuthorityAdvisoryCard';
import { NCAPComparisonCard } from '@/components/NCAPComparisonCard';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { ExplainAQIModal } from '@/components/ExplainAQIModal';
import { ExposureProjectionCard } from '@/components/ExposureProjectionCard';
import { CityPersonalityBadge } from '@/components/CityPersonalityBadge';
import { WardRiskRanking } from '@/components/WardRiskRanking';
import { getCityById, getHourlyTrend, getWeeklyTrend } from '@/data/pollutionData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const city = getCityById(cityId || '');

  if (!city) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-20">
          <h1 className="text-xl font-display font-bold text-foreground mb-3">City Not Found</h1>
          <p className="text-sm text-muted-foreground mb-5">The city you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} size="sm">Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const hourlyTrend = getHourlyTrend(city.id).map(d => ({ label: d.hour, aqi: d.aqi }));
  const weeklyTrend = getWeeklyTrend(city.id).map(d => ({ label: d.day, aqi: d.aqi }));

  const pollutantLimits = {
    pm25: 60,
    pm10: 100,
    no2: 80,
    so2: 80,
    co: 4,
    o3: 180,
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{city.name}</span>
        </div>

        {/* City Header */}
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
                  {city.name}
                </h1>
                <LiveIndicator />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{(city.population / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{city.stationCount} stations</span>
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
              value={city.aqi} 
              category={city.category}
              size="sm"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <AQIBadge category={city.category} size="sm" />
                <ExplainAQIModal aqi={city.aqi} category={city.category} />
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                <span>{new Date(city.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* City Personality & Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <CityPersonalityBadge aqi={city.aqi} category={city.category} className="mb-3" />
          <AQIChangePanel currentAQI={city.aqi} />
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
                <PollutantCard name="PM2.5" value={city.pollutants.pm25} unit="µg/m³" limit={pollutantLimits.pm25} />
                <PollutantCard name="PM10" value={city.pollutants.pm10} unit="µg/m³" limit={pollutantLimits.pm10} />
                <PollutantCard name="NO₂" value={city.pollutants.no2} unit="µg/m³" limit={pollutantLimits.no2} />
                <PollutantCard name="SO₂" value={city.pollutants.so2} unit="µg/m³" limit={pollutantLimits.so2} />
                <PollutantCard name="CO" value={city.pollutants.co} unit="mg/m³" limit={pollutantLimits.co} />
                <PollutantCard name="O₃" value={city.pollutants.o3} unit="µg/m³" limit={pollutantLimits.o3} />
              </div>
            </motion.div>

            {/* AQI Trends */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="hourly">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-sm text-foreground">AQI Trends</h2>
                  <TabsList className="h-7">
                    <TabsTrigger value="hourly" className="text-xs h-6 px-2">24h</TabsTrigger>
                    <TabsTrigger value="weekly" className="text-xs h-6 px-2">7d</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="hourly">
                  <AQITrendChart data={hourlyTrend} title="Hourly AQI Trend" />
                </TabsContent>
                <TabsContent value="weekly">
                  <AQITrendChart data={weeklyTrend} title="Weekly AQI Trend" />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Ward-wise AQI */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="widget-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-sm text-foreground">Ward-wise AQI</h2>
                <span className="text-xs text-muted-foreground">{city.wards.length} wards</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {city.wards.map((ward, index) => (
                  <WardCard 
                    key={ward.id} 
                    ward={ward} 
                    cityId={city.id}
                    delay={index * 0.03}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-4">
            <DailyLifeImpactCard category={city.category} />
            <HealthAdvisoryCard category={city.category} />
            <SafetyChecklistCard category={city.category} />
            <RiskIndexCard aqi={city.aqi} population={city.population} category={city.category} />
            <VulnerableImpactCard population={city.population} category={city.category} />
            <NCAPComparisonCard currentAQI={city.aqi} cityName={city.name} />
            <ExposureProjectionCard aqi={city.aqi} category={city.category} />
            
            {(city.category === 'poor' || city.category === 'very-poor' || city.category === 'severe') && (
              <div className="widget-card p-4">
                <GRAPActions currentCategory={city.category} />
              </div>
            )}

            <AuthorityAdvisoryCard category={city.category} />
            <WardRiskRanking wards={city.wards} cityId={city.id} />
            
            <div className="widget-card p-4">
              <SourceBreakdown />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CityDetail;
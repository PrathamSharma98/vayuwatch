import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Activity,
  Clock,
  Wind,
  Droplets
} from 'lucide-react';
import { Header } from '@/components/Header';
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">City Not Found</h1>
          <p className="text-muted-foreground mb-6">The city you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const hourlyTrend = getHourlyTrend(city.id).map(d => ({ label: d.hour, aqi: d.aqi }));
  const weeklyTrend = getWeeklyTrend(city.id).map(d => ({ label: d.day, aqi: d.aqi }));

  // Pollutant limits (CPCB standards)
  const pollutantLimits = {
    pm25: 60, // µg/m³
    pm10: 100,
    no2: 80,
    so2: 80,
    co: 4, // mg/m³
    o3: 180, // µg/m³
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">{city.name}</span>
        </div>

        {/* City Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                  {city.name}
                </h1>
                <LiveIndicator />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{city.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{(city.population / 1000000).toFixed(1)}M residents</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span>{city.stationCount} monitoring stations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 rounded-xl bg-card border border-border/50">
            <AQIGauge 
              value={city.aqi} 
              category={city.category}
              size="md"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AQIBadge category={city.category} size="lg" />
                <ExplainAQIModal aqi={city.aqi} category={city.category} />
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge />
                <AQIChangePanel currentAQI={city.aqi} compact />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated: {new Date(city.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* City Personality & Intelligence Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CityPersonalityBadge aqi={city.aqi} category={city.category} className="mb-3" />
          <AQIChangePanel currentAQI={city.aqi} />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pollutant Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-card border border-border/50 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-foreground">Air Pollutants</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <PollutantCard 
                  name="PM2.5" 
                  value={city.pollutants.pm25} 
                  unit="µg/m³" 
                  limit={pollutantLimits.pm25} 
                />
                <PollutantCard 
                  name="PM10" 
                  value={city.pollutants.pm10} 
                  unit="µg/m³" 
                  limit={pollutantLimits.pm10} 
                />
                <PollutantCard 
                  name="NO₂" 
                  value={city.pollutants.no2} 
                  unit="µg/m³" 
                  limit={pollutantLimits.no2} 
                />
                <PollutantCard 
                  name="SO₂" 
                  value={city.pollutants.so2} 
                  unit="µg/m³" 
                  limit={pollutantLimits.so2} 
                />
                <PollutantCard 
                  name="CO" 
                  value={city.pollutants.co} 
                  unit="mg/m³" 
                  limit={pollutantLimits.co} 
                />
                <PollutantCard 
                  name="O₃" 
                  value={city.pollutants.o3} 
                  unit="µg/m³" 
                  limit={pollutantLimits.o3} 
                />
              </div>
            </motion.div>

            {/* AQI Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="hourly">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-foreground">AQI Trends</h2>
                  <TabsList>
                    <TabsTrigger value="hourly">24 Hours</TabsTrigger>
                    <TabsTrigger value="weekly">7 Days</TabsTrigger>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-card border border-border/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-foreground">Ward-wise AQI</h2>
                <span className="text-sm text-muted-foreground">{city.wards.length} wards</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {city.wards.map((ward, index) => (
                  <WardCard 
                    key={ward.id} 
                    ward={ward} 
                    cityId={city.id}
                    delay={index * 0.05}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Daily Life Impact */}
            <DailyLifeImpactCard category={city.category} />

            {/* Health Advisory */}
            <HealthAdvisoryCard category={city.category} />

            {/* Safety Checklist */}
            <SafetyChecklistCard category={city.category} />

            {/* Risk Index */}
            <RiskIndexCard aqi={city.aqi} population={city.population} category={city.category} />

            {/* Vulnerable Population */}
            <VulnerableImpactCard population={city.population} category={city.category} />

            {/* NCAP Comparison */}
            <NCAPComparisonCard currentAQI={city.aqi} cityName={city.name} />

            {/* Exposure Projection */}
            <ExposureProjectionCard aqi={city.aqi} category={city.category} />

            {/* GRAP Actions */}
            {(city.category === 'poor' || city.category === 'very-poor' || city.category === 'severe') && (
              <div className="rounded-xl bg-card border border-border/50 p-6">
                <GRAPActions currentCategory={city.category} />
              </div>
            )}

            {/* Authority Advisory */}
            <AuthorityAdvisoryCard category={city.category} />

            {/* Ward Risk Ranking */}
            <WardRiskRanking wards={city.wards} cityId={city.id} />

            {/* Pollution Sources */}
            <div className="rounded-xl bg-card border border-border/50 p-6">
              <SourceBreakdown />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CityDetail;

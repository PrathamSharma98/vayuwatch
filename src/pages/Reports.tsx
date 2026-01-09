import { motion } from 'framer-motion';
import { FileText, Download, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { statesData, getAllCities, getAQILabel } from '@/data/pollutionData';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  generateNationalPDF, 
  generateStatePDF, 
  generateCityPDF,
  generateNationalCSV 
} from '@/utils/reportGenerator';
import { useLiveAQI } from '@/hooks/useLiveAQI';

const Reports = () => {
  const { states, getNationalStats } = useLiveAQI();
  const allCities = states.flatMap(s => s.cities);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleDownload = async (type: 'pdf' | 'csv', target: 'national' | 'state' | 'city', id?: string) => {
    const key = `${type}-${target}-${id || 'all'}`;
    setLoadingReport(key);
    
    // Small delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (target === 'national') {
        if (type === 'pdf') {
          generateNationalPDF(states, getNationalStats());
        } else {
          generateNationalCSV(states);
        }
      } else if (target === 'state' && id) {
        const state = states.find(s => s.id === id);
        if (state) generateStatePDF(state);
      } else if (target === 'city' && id) {
        const city = allCities.find(c => c.id === id);
        if (city) generateCityPDF(city);
      }

      toast({
        title: '✓ Report Downloaded',
        description: `Your ${type.toUpperCase()} report has been generated.`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to generate report. Please try again.',
        variant: 'destructive',
      });
    }

    setLoadingReport(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              AQI Reports
            </h1>
          </div>
          <p className="text-muted-foreground">
            Download detailed air quality reports for states, cities, and wards
          </p>
        </motion.div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">National Report</h3>
                <p className="text-sm text-muted-foreground">All India summary</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive report covering all states and major cities with national AQI trends.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('pdf', 'national')}
                disabled={loadingReport === 'pdf-national-all'}
                className="flex items-center gap-1"
              >
                {loadingReport === 'pdf-national-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('csv', 'national')}
                disabled={loadingReport === 'csv-national-all'}
                className="flex items-center gap-1"
              >
                {loadingReport === 'csv-national-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                CSV
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Monthly Report</h3>
                <p className="text-sm text-muted-foreground">Trends & analysis</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Month-over-month comparison with seasonal patterns and pollution hotspots.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('PDF', 'Monthly')}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('CSV', 'Monthly')}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">NCAP Progress</h3>
                <p className="text-sm text-muted-foreground">Target tracking</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              National Clean Air Programme progress report with city-wise target achievements.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('PDF', 'NCAP')}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('CSV', 'NCAP')}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </motion.div>
        </div>

        {/* State-wise Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-card border border-border/50 overflow-hidden"
        >
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-foreground">State-wise Reports</h2>
          </div>
          
          <div className="divide-y divide-border/50">
            {statesData.map((state, index) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-foreground">{state.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.cities.length} cities • AQI: {state.aqi} ({getAQILabel(state.category)})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDownload('PDF', state.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* City Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-card border border-border/50 overflow-hidden mt-6"
        >
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-foreground">City-wise Reports</h2>
          </div>
          
          <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto scrollbar-thin">
            {allCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-foreground">{city.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {city.state} • {city.wards.length} wards • AQI: {city.aqi}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDownload('PDF', city.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Reports;

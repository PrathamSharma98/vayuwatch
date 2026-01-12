import { motion } from 'framer-motion';
import { FileText, Download, Calendar, MapPin, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
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
    <DashboardLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              AQI Reports
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Download detailed air quality reports for states, cities, and wards
          </p>
        </motion.div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">National Report</h3>
                <p className="text-xs text-muted-foreground">All India summary</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Comprehensive report covering all states and major cities.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('pdf', 'national')}
                disabled={loadingReport === 'pdf-national-all'}
                className="flex-1 h-8 text-xs"
              >
                {loadingReport === 'pdf-national-all' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                <span className="ml-1">PDF</span>
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('csv', 'national')}
                disabled={loadingReport === 'csv-national-all'}
                className="flex-1 h-8 text-xs"
              >
                {loadingReport === 'csv-national-all' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                <span className="ml-1">CSV</span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">Monthly Report</h3>
                <p className="text-xs text-muted-foreground">Trends & analysis</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Month-over-month comparison with seasonal patterns.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('pdf', 'national')}
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3" />
                <span className="ml-1">PDF</span>
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('csv', 'national')}
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3" />
                <span className="ml-1">CSV</span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">NCAP Progress</h3>
                <p className="text-xs text-muted-foreground">Target tracking</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              National Clean Air Programme progress report.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleDownload('pdf', 'national')}
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3" />
                <span className="ml-1">PDF</span>
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleDownload('csv', 'national')}
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3" />
                <span className="ml-1">CSV</span>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* State-wise Reports */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="widget-card overflow-hidden mb-5"
        >
          <div className="px-4 py-3 border-b border-border/40">
            <h2 className="font-display font-semibold text-sm text-foreground">State-wise Reports</h2>
          </div>
          
          <div className="divide-y divide-border/30">
            {statesData.map((state, index) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-sm text-foreground">{state.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {state.cities.length} cities • AQI: {state.aqi} ({getAQILabel(state.category)})
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDownload('pdf', 'state', state.id)}
                  className="h-7 w-7 p-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* City Reports */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="widget-card overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border/40">
            <h2 className="font-display font-semibold text-sm text-foreground">City-wise Reports</h2>
          </div>
          
          <div className="divide-y divide-border/30 max-h-[350px] overflow-y-auto scrollbar-thin">
            {allCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.01 }}
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-sm text-foreground">{city.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {city.state} • {city.wards.length} wards • AQI: {city.aqi}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDownload('pdf', 'city', city.id)}
                  className="h-7 w-7 p-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
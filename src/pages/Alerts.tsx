import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Clock, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AQIBadge } from '@/components/AQIBadge';
import { statesData, getAllCities, getAQIColor } from '@/data/pollutionData';

const Alerts = () => {
  const allCities = getAllCities();
  const severeCities = allCities.filter(c => c.category === 'severe' || c.category === 'very-poor');
  const poorCities = allCities.filter(c => c.category === 'poor');

  const alerts = [
    ...severeCities.map(city => ({
      id: city.id,
      type: 'severe' as const,
      title: `Severe Air Quality Alert - ${city.name}`,
      description: `AQI has reached ${city.aqi}. Emergency measures recommended.`,
      location: `${city.name}, ${city.state}`,
      time: '10 mins ago',
      aqi: city.aqi,
      category: city.category,
    })),
    ...poorCities.map(city => ({
      id: city.id,
      type: 'warning' as const,
      title: `Poor Air Quality Warning - ${city.name}`,
      description: `AQI is ${city.aqi}. Sensitive groups should limit outdoor exposure.`,
      location: `${city.name}, ${city.state}`,
      time: '25 mins ago',
      aqi: city.aqi,
      category: city.category,
    })),
  ].sort((a, b) => b.aqi - a.aqi);

  return (
    <DashboardLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              Air Quality Alerts
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time alerts for poor and severe air quality conditions across India
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-danger/10">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <span className="font-medium text-sm text-danger">Severe Alerts</span>
            </div>
            <p className="text-3xl font-display font-bold text-danger font-mono">{severeCities.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cities with AQI &gt; 300</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <span className="font-medium text-sm text-warning">Warnings</span>
            </div>
            <p className="text-3xl font-display font-bold text-warning font-mono">{poorCities.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cities with AQI 201-300</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="widget-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm text-foreground">Total Alerts</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground font-mono">{alerts.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active alerts</p>
          </motion.div>
        </div>

        {/* Alert List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="widget-card overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border/40">
            <h2 className="font-display font-semibold text-sm text-foreground">Active Alerts</h2>
          </div>
          
          <div className="divide-y divide-border/30">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active alerts at this time
              </div>
            ) : (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-md"
                      style={{ 
                        backgroundColor: `${getAQIColor(alert.category)}15`,
                      }}
                    >
                      <AlertTriangle 
                        className="w-4 h-4" 
                        style={{ color: getAQIColor(alert.category) }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm text-foreground truncate">{alert.title}</h3>
                        <AQIBadge category={alert.category} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="text-xl font-display font-bold font-mono"
                      style={{ color: getAQIColor(alert.category) }}
                    >
                      {alert.aqi}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
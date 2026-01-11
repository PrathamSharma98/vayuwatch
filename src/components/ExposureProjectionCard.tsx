import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Info } from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { getExposureProjection } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ExposureProjectionCardProps {
  aqi: number;
  category: AQICategory;
  className?: string;
}

const riskColors = {
  'Minimal': 'text-aqi-good bg-aqi-good/10',
  'Low': 'text-aqi-satisfactory bg-aqi-satisfactory/10',
  'Moderate': 'text-warning bg-warning/10',
  'Elevated': 'text-aqi-poor bg-aqi-poor/10',
  'High': 'text-danger bg-danger/10',
};

export function ExposureProjectionCard({ aqi, category, className }: ExposureProjectionCardProps) {
  const projection = getExposureProjection(aqi, category);
  const isHighRisk = projection.riskLevel === 'Elevated' || projection.riskLevel === 'High';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        isHighRisk ? 'bg-danger/5 border-danger/30' : 'bg-card border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn('w-5 h-5', isHighRisk ? 'text-danger' : 'text-primary')} />
          <h3 className="font-display font-semibold text-foreground">7-Day Exposure Outlook</h3>
        </div>
        <Badge className={cn('text-xs', riskColors[projection.riskLevel])}>
          {projection.riskLevel} Risk
        </Badge>
      </div>

      <p className="text-sm text-foreground mb-3">
        {projection.statement}
      </p>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {projection.disclaimer}
        </p>
      </div>
    </motion.div>
  );
}

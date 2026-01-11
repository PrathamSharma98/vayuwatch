import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { getNCAPComparison } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface NCAPComparisonCardProps {
  currentAQI: number;
  cityName?: string;
  className?: string;
}

export function NCAPComparisonCard({ currentAQI, cityName, className }: NCAPComparisonCardProps) {
  const comparison = getNCAPComparison(currentAQI);

  const statusColors = {
    'On Track': 'text-aqi-good',
    'Behind': 'text-warning',
    'Critical': 'text-danger',
  };

  const statusBg = {
    'On Track': 'bg-aqi-good/10',
    'Behind': 'bg-warning/10',
    'Critical': 'bg-danger/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-card border border-border/50 p-4', className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">NCAP Target Progress</h3>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-foreground">{currentAQI}</div>
          <div className="text-xs text-muted-foreground">Current AQI</div>
        </div>
        <div className="text-center px-3">
          <div className={cn('text-sm font-medium', statusColors[comparison.status])}>
            {comparison.status}
          </div>
          <div className="text-xs text-muted-foreground">Progress Status</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{comparison.targetAQI}</div>
          <div className="text-xs text-muted-foreground">Target by {comparison.yearToAchieve}</div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress towards target</span>
          <span className={cn('font-medium', statusColors[comparison.status])}>
            {comparison.progress}%
          </span>
        </div>
        <Progress value={comparison.progress} className="h-2" />
      </div>

      {comparison.gap > 0 && (
        <div className={cn('p-2 rounded-lg', statusBg[comparison.status])}>
          <div className="flex items-center gap-2">
            <AlertCircle className={cn('w-4 h-4', statusColors[comparison.status])} />
            <span className={cn('text-xs font-medium', statusColors[comparison.status])}>
              {comparison.gap} AQI points above target
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        National Clean Air Programme (NCAP) targets 20-30% reduction in particulate matter by 2026.
      </p>
    </motion.div>
  );
}

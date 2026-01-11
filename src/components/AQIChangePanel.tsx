import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { getAQIChange } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AQIChangePanelProps {
  currentAQI: number;
  previousAQI?: number;
  className?: string;
  compact?: boolean;
}

export function AQIChangePanel({ currentAQI, previousAQI, className, compact = false }: AQIChangePanelProps) {
  const change = getAQIChange(currentAQI, previousAQI);
  
  const getIcon = () => {
    if (change.direction === 'improved') return TrendingDown;
    if (change.direction === 'worsened') return TrendingUp;
    return Minus;
  };
  
  const getColor = () => {
    if (change.direction === 'improved') return 'text-aqi-good';
    if (change.direction === 'worsened') return 'text-danger';
    return 'text-muted-foreground';
  };
  
  const getBgColor = () => {
    if (change.direction === 'improved') return 'bg-aqi-good/10';
    if (change.direction === 'worsened') return 'bg-danger/10';
    return 'bg-muted/30';
  };
  
  const Icon = getIcon();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help',
                getBgColor(),
                getColor(),
                className
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{change.direction === 'stable' ? '~' : (change.direction === 'improved' ? '-' : '+')}{change.change}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">{change.explanation}</p>
            <p className="text-xs text-muted-foreground mt-1">Contributing factor: {change.factor}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg p-3', getBgColor(), className)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-full', getBgColor())}>
          <Icon className={cn('w-4 h-4', getColor())} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">Since Yesterday</span>
            <span className={cn('text-sm font-bold', getColor())}>
              {change.direction === 'improved' ? '↓' : change.direction === 'worsened' ? '↑' : '~'}
              {change.change} pts
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {change.explanation}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Factor: {change.factor}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

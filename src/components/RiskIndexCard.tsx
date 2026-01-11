import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info, Users, Baby, Activity } from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { calculateRiskIndex, RiskLevel } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface RiskIndexCardProps {
  aqi: number;
  population: number;
  category: AQICategory;
  className?: string;
  compact?: boolean;
}

const riskColors: Record<RiskLevel, string> = {
  'Low': 'text-aqi-good',
  'Medium': 'text-warning',
  'High': 'text-aqi-poor',
  'Critical': 'text-danger',
};

const riskBgColors: Record<RiskLevel, string> = {
  'Low': 'bg-aqi-good',
  'Medium': 'bg-warning',
  'High': 'bg-aqi-poor',
  'Critical': 'bg-danger',
};

export function RiskIndexCard({ aqi, population, category, className, compact = false }: RiskIndexCardProps) {
  const risk = calculateRiskIndex(aqi, population, category);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-help',
                `${riskBgColors[risk.level]}/20`,
                riskColors[risk.level],
                className
              )}
            >
              <Shield className="w-3 h-3" />
              <span>Risk: {risk.level}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm font-medium mb-1">Pollution Risk Index: {risk.score}/100</p>
            <p className="text-xs text-muted-foreground">{risk.explanation}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-card border border-border/50 p-4', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Pollution Risk Index</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">Composite score derived from AQI level, population density, and vulnerable population (children + elderly).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            `${riskBgColors[risk.level]}/20`
          )}>
            <span className={cn('text-2xl font-bold', riskColors[risk.level])}>
              {risk.score}
            </span>
          </div>
        </div>
        <div>
          <div className={cn('text-lg font-semibold', riskColors[risk.level])}>
            {risk.level} Risk
          </div>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {risk.factors.map((factor, index) => (
          <div key={factor.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{factor.name}</span>
              <span className="font-medium text-foreground">{factor.contribution}%</span>
            </div>
            <Progress value={factor.contribution} className="h-1.5" />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {risk.explanation}
      </p>
    </motion.div>
  );
}

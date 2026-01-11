import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { getConfidenceLevel, ConfidenceLevel } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceBadgeProps {
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, { color: string; icon: typeof Shield }> = {
  'High': { color: 'text-aqi-good bg-aqi-good/10', icon: Shield },
  'Medium': { color: 'text-warning bg-warning/10', icon: AlertTriangle },
  'Simulated': { color: 'text-primary bg-primary/10', icon: Info },
};

export function ConfidenceBadge({ className }: ConfidenceBadgeProps) {
  const confidence = getConfidenceLevel();
  const config = confidenceConfig[confidence.level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-help',
              config.color,
              className
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{confidence.label}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">{confidence.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

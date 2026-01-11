import { motion } from 'framer-motion';
import { 
  Sun, 
  Briefcase, 
  GraduationCap, 
  Car, 
  Dumbbell, 
  Wind,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { getDailyLifeImpact, DailyLifeImpact } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';

interface DailyLifeImpactCardProps {
  category: AQICategory;
  className?: string;
}

const getStatusIcon = (status: string) => {
  if (status === 'Allowed' || status === 'Safe' || status === 'Normal' || status === 'Open') {
    return <Check className="w-4 h-4 text-aqi-good" />;
  }
  if (status === 'Avoid' || status === 'Unsafe' || status === 'Cancel' || status === 'Not Advised' || status === 'Closed') {
    return <X className="w-4 h-4 text-danger" />;
  }
  return <AlertTriangle className="w-4 h-4 text-warning" />;
};

const getStatusColor = (status: string) => {
  if (status === 'Allowed' || status === 'Safe' || status === 'Normal' || status === 'Open') {
    return 'text-aqi-good';
  }
  if (status === 'Avoid' || status === 'Unsafe' || status === 'Cancel' || status === 'Not Advised' || status === 'Closed') {
    return 'text-danger';
  }
  return 'text-warning';
};

export function DailyLifeImpactCard({ category, className }: DailyLifeImpactCardProps) {
  const impact = getDailyLifeImpact(category);
  
  const items = [
    { icon: Sun, label: 'Morning Walk', ...impact.morningWalk },
    { icon: Briefcase, label: 'Outdoor Work', ...impact.outdoorWork },
    { icon: GraduationCap, label: 'School Activities', ...impact.schoolActivity },
    { icon: Car, label: 'Commute', ...impact.commute },
    { icon: Dumbbell, label: 'Exercise', ...impact.exercise },
    { icon: Wind, label: 'Ventilation', ...impact.windowVentilation },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-card border border-border/50 p-4', className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Daily Life Impact</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(item.status)}
                <span className={cn('text-sm font-medium', getStatusColor(item.status))}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.advice}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { CheckSquare, Square, AlertTriangle, Shield } from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { getSafetyChecklist } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';

interface SafetyChecklistCardProps {
  category: AQICategory;
  className?: string;
}

export function SafetyChecklistCard({ category, className }: SafetyChecklistCardProps) {
  const checklist = getSafetyChecklist(category);
  const isSevere = category === 'very-poor' || category === 'severe';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        isSevere ? 'bg-danger/5 border-danger/30' : 'bg-card border-border/50',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Shield className={cn('w-5 h-5', isSevere ? 'text-danger' : 'text-primary')} />
        <h3 className="font-display font-semibold text-foreground">Safety Checklist</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{checklist.summary}</p>

      <div className="space-y-2">
        {checklist.items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-start gap-2 p-2 rounded-lg',
              item.priority === 'high' ? 'bg-danger/10' : 'bg-secondary/30'
            )}
          >
            {item.checked ? (
              <CheckSquare className="w-4 h-4 text-aqi-good flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className={cn(
              'text-sm',
              item.priority === 'high' ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>
            {item.priority === 'high' && (
              <AlertTriangle className="w-3 h-3 text-danger ml-auto flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

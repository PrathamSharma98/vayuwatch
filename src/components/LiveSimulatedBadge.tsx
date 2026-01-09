import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface LiveSimulatedBadgeProps {
  lastUpdated?: Date;
  className?: string;
}

export function LiveSimulatedBadge({ lastUpdated, className }: LiveSimulatedBadgeProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Live Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/30"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-success"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="text-xs font-medium text-success">LIVE</span>
      </motion.div>

      {/* Simulated Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info/10 border border-info/30">
        <Activity className="w-3 h-3 text-info" />
        <span className="text-xs font-medium text-info">Simulated</span>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
        </div>
      )}
    </div>
  );
}

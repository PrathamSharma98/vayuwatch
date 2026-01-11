import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type MapDensity = 'sparse' | 'medium' | 'dense';

interface HeatmapDensityControlProps {
  value: MapDensity;
  onChange: (value: MapDensity) => void;
  className?: string;
}

export function HeatmapDensityControl({ value, onChange, className }: HeatmapDensityControlProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50',
        className
      )}
    >
      <Layers className="w-4 h-4 text-muted-foreground ml-1" />
      <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as MapDensity)}>
        <ToggleGroupItem value="sparse" size="sm" className="text-xs px-2 py-1 h-7">
          City
        </ToggleGroupItem>
        <ToggleGroupItem value="medium" size="sm" className="text-xs px-2 py-1 h-7">
          Ward
        </ToggleGroupItem>
        <ToggleGroupItem value="dense" size="sm" className="text-xs px-2 py-1 h-7">
          All
        </ToggleGroupItem>
      </ToggleGroup>
    </motion.div>
  );
}

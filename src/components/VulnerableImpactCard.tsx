import { motion } from 'framer-motion';
import { Users, Baby, Heart, Stethoscope, AlertCircle } from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { getVulnerableImpact } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';

interface VulnerableImpactCardProps {
  population: number;
  category: AQICategory;
  className?: string;
}

const formatNumber = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};

export function VulnerableImpactCard({ population, category, className }: VulnerableImpactCardProps) {
  const impact = getVulnerableImpact(population, category);
  const isSevere = category === 'poor' || category === 'very-poor' || category === 'severe';

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
      <div className="flex items-center gap-2 mb-4">
        <Users className={cn('w-5 h-5', isSevere ? 'text-danger' : 'text-primary')} />
        <h3 className="font-display font-semibold text-foreground">Vulnerable Population Impact</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <Baby className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold text-foreground">{formatNumber(impact.childrenAffected)}</div>
          <div className="text-xs text-muted-foreground">Children</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <Heart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold text-foreground">{formatNumber(impact.elderlyAffected)}</div>
          <div className="text-xs text-muted-foreground">Elderly</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <Stethoscope className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-bold text-foreground">{formatNumber(impact.respiratoryPatients)}</div>
          <div className="text-xs text-muted-foreground">Respiratory</div>
        </div>
      </div>

      {isSevere && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 mb-3">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-danger">
              ~{formatNumber(impact.atRiskPopulation)} At Health Risk
            </div>
            <p className="text-xs text-danger/80">Today's conditions may cause health symptoms</p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {impact.impactStatement}
      </p>
    </motion.div>
  );
}

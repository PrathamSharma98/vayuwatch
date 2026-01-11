import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Users, Factory } from 'lucide-react';
import { Ward, getAQIColor, AQICategory } from '@/data/pollutionData';
import { calculateRiskIndex } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { AQIBadge } from '@/components/AQIBadge';
import { useNavigate } from 'react-router-dom';

interface WardRiskRankingProps {
  wards: Ward[];
  cityId: string;
  className?: string;
  maxItems?: number;
}

export function WardRiskRanking({ wards, cityId, className, maxItems = 5 }: WardRiskRankingProps) {
  const navigate = useNavigate();
  
  const rankedWards = useMemo(() => {
    return wards
      .map(ward => ({
        ...ward,
        risk: calculateRiskIndex(ward.aqi, ward.population, ward.category),
      }))
      .sort((a, b) => b.risk.score - a.risk.score)
      .slice(0, maxItems);
  }, [wards, maxItems]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl bg-card border border-border/50 p-4', className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-danger" />
        <h3 className="font-display font-semibold text-foreground">Most At-Risk Wards</h3>
      </div>

      <div className="space-y-2">
        {rankedWards.map((ward, index) => (
          <motion.button
            key={ward.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/ward/${ward.id}`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: getAQIColor(ward.category) }}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground text-sm truncate">{ward.name}</span>
                <AQIBadge category={ward.category} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {(ward.population / 1000).toFixed(0)}K
                </span>
                <span className="flex items-center gap-1">
                  <Factory className="w-3 h-3" />
                  {ward.dominantSource}
                </span>
                <span className="text-danger font-medium">
                  Risk: {ward.risk.score}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

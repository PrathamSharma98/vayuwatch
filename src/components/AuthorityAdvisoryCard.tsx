import { motion } from 'framer-motion';
import { Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AQICategory } from '@/data/pollutionData';
import { getAuthorityRecommendations, AuthorityAction } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AuthorityAdvisoryCardProps {
  category: AQICategory;
  className?: string;
}

const urgencyColors = {
  immediate: 'bg-danger text-white',
  recommended: 'bg-warning text-warning-foreground',
  advisory: 'bg-secondary text-secondary-foreground',
};

const urgencyIcons = {
  immediate: AlertCircle,
  recommended: Clock,
  advisory: CheckCircle2,
};

export function AuthorityAdvisoryCard({ category, className }: AuthorityAdvisoryCardProps) {
  const recommendations = getAuthorityRecommendations(category);
  const hasEmergency = recommendations.some(r => r.urgency === 'immediate');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        hasEmergency ? 'bg-danger/5 border-danger/30' : 'bg-card border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className={cn('w-5 h-5', hasEmergency ? 'text-danger' : 'text-primary')} />
          <h3 className="font-display font-semibold text-foreground">Authority Advisory</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Suggestive
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Recommended actions for local authorities based on GRAP guidelines
      </p>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const UrgencyIcon = urgencyIcons[rec.urgency];
          return (
            <motion.div
              key={rec.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg bg-secondary/30 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn('text-xs', urgencyColors[rec.urgency])}>
                  <UrgencyIcon className="w-3 h-3 mr-1" />
                  {rec.urgency === 'immediate' ? 'Immediate' : rec.urgency === 'recommended' ? 'Recommended' : 'Advisory'}
                </Badge>
                <span className="text-sm font-medium text-foreground">{rec.category}</span>
              </div>
              <ul className="space-y-1 ml-1">
                {rec.actions.slice(0, 3).map((action, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
                {rec.actions.length > 3 && (
                  <li className="text-xs text-muted-foreground/70">
                    +{rec.actions.length - 3} more actions
                  </li>
                )}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

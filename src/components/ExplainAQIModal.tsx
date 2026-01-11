import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, AlertTriangle, CheckCircle, Clock, Heart } from 'lucide-react';
import { AQICategory, getAQILabel, getAQIColor } from '@/data/pollutionData';
import { explainAQI } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExplainAQIModalProps {
  aqi: number;
  category: AQICategory;
  dominantSource?: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function ExplainAQIModal({ aqi, category, dominantSource, trigger, className }: ExplainAQIModalProps) {
  const explanation = explainAQI(aqi, category, dominantSource);
  const color = getAQIColor(category);
  const isSevere = category === 'very-poor' || category === 'severe';

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={cn('gap-1', className)}>
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs">Explain</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              {aqi}
            </div>
            <div>
              <div className="text-lg">Understanding AQI {aqi}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {getAQILabel(category)} Air Quality
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* What it means */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <HelpCircle className="w-4 h-4 text-primary" />
              What does this mean?
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {explanation.whatItMeans}
            </p>
          </div>

          {/* Why it happened */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className={cn('w-4 h-4', isSevere ? 'text-danger' : 'text-warning')} />
              Why is it this way today?
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {explanation.whyItHappened}
            </p>
          </div>

          {/* What to do */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-aqi-good" />
              What should I do?
            </div>
            <ul className="space-y-1 pl-6">
              {explanation.whatToDo.map((action, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Health effects */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Heart className={cn('w-4 h-4', isSevere ? 'text-danger' : 'text-primary')} />
              Health Effects
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {explanation.healthEffects}
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Expected Duration
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {explanation.duration}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Data based on CPCB standards. For personalized health advice, consult a physician.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { motion } from 'framer-motion';
import { AQICategory } from '@/data/pollutionData';
import { getCityPersonality } from '@/utils/aqiIntelligence';
import { cn } from '@/lib/utils';

interface CityPersonalityBadgeProps {
  aqi: number;
  category: AQICategory;
  className?: string;
}

const categoryStyles: Record<AQICategory, string> = {
  'good': 'bg-aqi-good/10 text-aqi-good border-aqi-good/30',
  'satisfactory': 'bg-aqi-satisfactory/10 text-aqi-satisfactory border-aqi-satisfactory/30',
  'moderate': 'bg-aqi-moderate/10 text-aqi-moderate border-aqi-moderate/30',
  'poor': 'bg-aqi-poor/10 text-aqi-poor border-aqi-poor/30',
  'very-poor': 'bg-aqi-very-poor/10 text-aqi-very-poor border-aqi-very-poor/30',
  'severe': 'bg-danger/10 text-danger border-danger/30',
};

export function CityPersonalityBadge({ aqi, category, className }: CityPersonalityBadgeProps) {
  const personality = getCityPersonality(aqi, category);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        categoryStyles[category],
        className
      )}
    >
      {personality}
    </motion.div>
  );
}

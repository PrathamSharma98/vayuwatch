// AQI Intelligence & Insight Engine for VayuWatch
import { AQICategory, getAQILabel, PollutantData } from '@/data/pollutionData';

// ============= Daily Life Impact Translator =============
export interface DailyLifeImpact {
  morningWalk: { status: 'Allowed' | 'Avoid' | 'Caution'; advice: string };
  outdoorWork: { status: 'Safe' | 'Risky' | 'Unsafe'; advice: string };
  schoolActivity: { status: 'Allowed' | 'Limited' | 'Cancel'; advice: string };
  commute: { status: 'Normal' | 'Mask Required' | 'Not Advised'; advice: string };
  exercise: { status: 'Safe' | 'Indoor Only' | 'Avoid'; advice: string };
  windowVentilation: { status: 'Open' | 'Limited' | 'Closed'; advice: string };
}

export function getDailyLifeImpact(category: AQICategory): DailyLifeImpact {
  const impacts: Record<AQICategory, DailyLifeImpact> = {
    'good': {
      morningWalk: { status: 'Allowed', advice: 'Perfect time for outdoor exercise' },
      outdoorWork: { status: 'Safe', advice: 'No restrictions on outdoor activities' },
      schoolActivity: { status: 'Allowed', advice: 'All sports and outdoor games permitted' },
      commute: { status: 'Normal', advice: 'No mask needed for healthy individuals' },
      exercise: { status: 'Safe', advice: 'Ideal conditions for running/cycling' },
      windowVentilation: { status: 'Open', advice: 'Fresh air circulation recommended' },
    },
    'satisfactory': {
      morningWalk: { status: 'Allowed', advice: 'Safe for most people' },
      outdoorWork: { status: 'Safe', advice: 'Minor precautions for sensitive individuals' },
      schoolActivity: { status: 'Allowed', advice: 'Regular activities can continue' },
      commute: { status: 'Normal', advice: 'Sensitive groups may consider masks' },
      exercise: { status: 'Safe', advice: 'Moderate intensity exercise is fine' },
      windowVentilation: { status: 'Open', advice: 'Natural ventilation is fine' },
    },
    'moderate': {
      morningWalk: { status: 'Caution', advice: 'Keep walks short, preferably early morning' },
      outdoorWork: { status: 'Risky', advice: 'Limit prolonged outdoor exposure' },
      schoolActivity: { status: 'Limited', advice: 'Reduce outdoor playtime duration' },
      commute: { status: 'Mask Required', advice: 'N95 mask advised during travel' },
      exercise: { status: 'Indoor Only', advice: 'Shift workouts indoors' },
      windowVentilation: { status: 'Limited', advice: 'Open windows only briefly' },
    },
    'poor': {
      morningWalk: { status: 'Avoid', advice: 'Skip outdoor walks, try indoor exercise' },
      outdoorWork: { status: 'Unsafe', advice: 'Essential work only with protection' },
      schoolActivity: { status: 'Cancel', advice: 'No outdoor activities for children' },
      commute: { status: 'Mask Required', advice: 'N95 mask mandatory, limit travel' },
      exercise: { status: 'Indoor Only', advice: 'Only indoor activities with air purifier' },
      windowVentilation: { status: 'Closed', advice: 'Keep windows shut, use air purifier' },
    },
    'very-poor': {
      morningWalk: { status: 'Avoid', advice: 'Stay indoors, health risk is high' },
      outdoorWork: { status: 'Unsafe', advice: 'Work from home if possible' },
      schoolActivity: { status: 'Cancel', advice: 'Schools should shift to online mode' },
      commute: { status: 'Not Advised', advice: 'Avoid travel, work from home' },
      exercise: { status: 'Avoid', advice: 'No strenuous activity even indoors' },
      windowVentilation: { status: 'Closed', advice: 'Seal windows, run air purifier' },
    },
    'severe': {
      morningWalk: { status: 'Avoid', advice: 'EMERGENCY: Do not go outdoors' },
      outdoorWork: { status: 'Unsafe', advice: 'All outdoor work banned' },
      schoolActivity: { status: 'Cancel', advice: 'Schools closed, online classes only' },
      commute: { status: 'Not Advised', advice: 'Travel only for emergencies' },
      exercise: { status: 'Avoid', advice: 'Complete rest advised' },
      windowVentilation: { status: 'Closed', advice: 'Emergency: Seal all openings' },
    },
  };
  return impacts[category];
}

// ============= What Changed Since Yesterday =============
export interface AQIChange {
  change: number;
  direction: 'improved' | 'worsened' | 'stable';
  factor: string;
  explanation: string;
  percentChange: number;
}

const changeFactors = [
  { factor: 'Traffic congestion', weight: 0.3 },
  { factor: 'Industrial activity', weight: 0.2 },
  { factor: 'Weather stagnation', weight: 0.15 },
  { factor: 'Low wind speed', weight: 0.12 },
  { factor: 'Construction dust', weight: 0.1 },
  { factor: 'Temperature inversion', weight: 0.08 },
  { factor: 'Stubble burning', weight: 0.05 },
];

export function getAQIChange(currentAQI: number, previousAQI?: number): AQIChange {
  // Simulate yesterday's AQI with slight variation
  const simulatedPrevious = previousAQI ?? Math.round(currentAQI * (0.85 + Math.random() * 0.3));
  const change = currentAQI - simulatedPrevious;
  const percentChange = Math.round(Math.abs(change / simulatedPrevious) * 100);
  
  let direction: AQIChange['direction'] = 'stable';
  if (change > 10) direction = 'worsened';
  else if (change < -10) direction = 'improved';
  
  // Pick contributing factor based on AQI level
  const factorIndex = Math.floor(Math.abs(change) % changeFactors.length);
  const primaryFactor = changeFactors[factorIndex].factor;
  
  let explanation = '';
  if (direction === 'improved') {
    explanation = `AQI improved by ${Math.abs(change)} points due to favorable wind conditions and reduced emissions.`;
  } else if (direction === 'worsened') {
    explanation = `AQI increased by ${change} points due to ${primaryFactor.toLowerCase()} and atmospheric conditions.`;
  } else {
    explanation = 'AQI levels remained relatively stable compared to yesterday.';
  }
  
  return {
    change: Math.abs(change),
    direction,
    factor: primaryFactor,
    explanation,
    percentChange,
  };
}

// ============= Pollution Risk Index =============
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskIndex {
  level: RiskLevel;
  score: number; // 0-100
  factors: { name: string; contribution: number }[];
  explanation: string;
}

export function calculateRiskIndex(
  aqi: number,
  population: number,
  category: AQICategory
): RiskIndex {
  // Base risk from AQI
  const aqiRisk = Math.min((aqi / 500) * 40, 40);
  
  // Population density factor (normalized)
  const popDensityRisk = Math.min((population / 1000000) * 20, 25);
  
  // Vulnerable population (assume 25% are children + elderly)
  const vulnerablePercent = 0.25;
  const vulnerableRisk = vulnerablePercent * 35;
  
  const score = Math.round(aqiRisk + popDensityRisk + vulnerableRisk);
  
  let level: RiskLevel = 'Low';
  if (score > 75) level = 'Critical';
  else if (score > 50) level = 'High';
  else if (score > 30) level = 'Medium';
  
  const factors = [
    { name: 'Air Quality Index', contribution: Math.round(aqiRisk) },
    { name: 'Population Density', contribution: Math.round(popDensityRisk) },
    { name: 'Vulnerable Groups', contribution: Math.round(vulnerableRisk) },
  ];
  
  const categoryLabel = getAQILabel(category);
  const explanation = `Risk level is ${level.toLowerCase()} based on ${categoryLabel} air quality affecting ${(population / 1000000).toFixed(1)}M residents, with ~${Math.round(population * vulnerablePercent / 1000)}K vulnerable individuals.`;
  
  return { level, score, factors, explanation };
}

// ============= Vulnerable Population Impact =============
export interface VulnerableImpact {
  totalPopulation: number;
  atRiskPopulation: number;
  childrenAffected: number;
  elderlyAffected: number;
  respiratoryPatients: number;
  impactStatement: string;
}

export function getVulnerableImpact(
  population: number,
  category: AQICategory
): VulnerableImpact {
  // Indian demographic estimates
  const childrenPercent = 0.26; // ~26% under 14
  const elderlyPercent = 0.09; // ~9% over 60
  const respiratoryPercent = 0.08; // ~8% with respiratory conditions
  
  const childrenAffected = Math.round(population * childrenPercent);
  const elderlyAffected = Math.round(population * elderlyPercent);
  const respiratoryPatients = Math.round(population * respiratoryPercent);
  
  // Risk multiplier based on AQI category
  const riskMultiplier: Record<AQICategory, number> = {
    'good': 0.05,
    'satisfactory': 0.1,
    'moderate': 0.25,
    'poor': 0.5,
    'very-poor': 0.75,
    'severe': 0.95,
  };
  
  const atRiskPopulation = Math.round(
    (childrenAffected + elderlyAffected + respiratoryPatients) * riskMultiplier[category]
  );
  
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  
  let impactStatement = '';
  if (category === 'good' || category === 'satisfactory') {
    impactStatement = `Air quality is safe for most residents. Standard precautions for ${formatNumber(respiratoryPatients)} respiratory patients.`;
  } else if (category === 'moderate') {
    impactStatement = `~${formatNumber(atRiskPopulation)} sensitive individuals may experience mild discomfort.`;
  } else if (category === 'poor') {
    impactStatement = `~${formatNumber(atRiskPopulation)} residents may experience respiratory symptoms today.`;
  } else {
    impactStatement = `~${formatNumber(atRiskPopulation)} residents at significant health risk. Medical preparedness advised.`;
  }
  
  return {
    totalPopulation: population,
    atRiskPopulation,
    childrenAffected,
    elderlyAffected,
    respiratoryPatients,
    impactStatement,
  };
}

// ============= Smart Alert Reasoning =============
export interface AlertReason {
  title: string;
  reason: string;
  triggers: string[];
  severity: 'info' | 'warning' | 'critical';
}

export function getAlertReason(
  aqi: number,
  category: AQICategory,
  dominantSource?: string
): AlertReason | null {
  if (category === 'good' || category === 'satisfactory') {
    return null;
  }
  
  const source = dominantSource || 'Multiple sources';
  
  if (category === 'severe') {
    return {
      title: 'Health Emergency Alert',
      reason: `AQI has reached ${aqi} (Severe) primarily due to ${source.toLowerCase()}. Temperature inversion is trapping pollutants near ground level.`,
      triggers: ['AQI > 400', 'PM2.5 critically high', 'Low wind dispersion'],
      severity: 'critical',
    };
  }
  
  if (category === 'very-poor') {
    return {
      title: 'Severe Air Quality Warning',
      reason: `AQI is ${aqi} (Very Poor) caused by ${source.toLowerCase()} combined with unfavorable meteorological conditions.`,
      triggers: ['AQI > 300', 'High particulate matter', 'Stagnant weather'],
      severity: 'critical',
    };
  }
  
  if (category === 'poor') {
    return {
      title: 'Poor Air Quality Advisory',
      reason: `AQI is ${aqi} (Poor) with ${source.toLowerCase()} as the primary contributor. Sensitive groups should take precautions.`,
      triggers: ['AQI > 200', 'Elevated PM2.5/PM10'],
      severity: 'warning',
    };
  }
  
  return {
    title: 'Moderate Air Quality Notice',
    reason: `AQI is ${aqi} (Moderate). Minor breathing discomfort possible for very sensitive individuals.`,
    triggers: ['AQI > 100', 'Moderate pollutant levels'],
    severity: 'info',
  };
}

// ============= Safety Checklist =============
export interface SafetyChecklist {
  items: { label: string; checked: boolean; priority: 'high' | 'medium' | 'low' }[];
  summary: string;
}

export function getSafetyChecklist(category: AQICategory): SafetyChecklist {
  const baseChecklist = [
    { label: 'Check AQI before outdoor activities', checked: true, priority: 'medium' as const },
  ];
  
  if (category === 'good' || category === 'satisfactory') {
    return {
      items: [
        ...baseChecklist,
        { label: 'Enjoy outdoor activities freely', checked: true, priority: 'low' },
      ],
      summary: 'Air quality is good. No special precautions needed.',
    };
  }
  
  if (category === 'moderate') {
    return {
      items: [
        ...baseChecklist,
        { label: 'Sensitive individuals should limit prolonged outdoor exposure', checked: false, priority: 'medium' },
        { label: 'Keep windows partially open for ventilation', checked: false, priority: 'low' },
      ],
      summary: 'Take basic precautions if you have respiratory conditions.',
    };
  }
  
  if (category === 'poor') {
    return {
      items: [
        { label: 'Wear N95 mask when going outside', checked: false, priority: 'high' },
        { label: 'Keep windows and doors closed', checked: false, priority: 'high' },
        { label: 'Use air purifier if available', checked: false, priority: 'medium' },
        { label: 'Avoid outdoor exercise', checked: false, priority: 'medium' },
        { label: 'Stay hydrated', checked: false, priority: 'medium' },
      ],
      summary: 'Protect yourself with masks and limit outdoor exposure.',
    };
  }
  
  // Very Poor or Severe
  return {
    items: [
      { label: 'Stay indoors as much as possible', checked: false, priority: 'high' },
      { label: 'Wear N95 mask if going outside is unavoidable', checked: false, priority: 'high' },
      { label: 'Seal windows and doors', checked: false, priority: 'high' },
      { label: 'Run air purifier on highest setting', checked: false, priority: 'high' },
      { label: 'Avoid all physical exertion', checked: false, priority: 'high' },
      { label: 'Keep emergency medicines ready', checked: false, priority: 'high' },
      { label: 'Monitor symptoms, seek medical help if needed', checked: false, priority: 'high' },
    ],
    summary: 'Emergency precautions required. Minimize all outdoor exposure.',
  };
}

// ============= Authority Recommendations =============
export interface AuthorityAction {
  category: string;
  actions: string[];
  urgency: 'immediate' | 'recommended' | 'advisory';
}

export function getAuthorityRecommendations(category: AQICategory): AuthorityAction[] {
  if (category === 'good' || category === 'satisfactory') {
    return [{
      category: 'Routine Monitoring',
      actions: ['Continue regular air quality monitoring', 'Maintain green cover initiatives'],
      urgency: 'advisory',
    }];
  }
  
  if (category === 'moderate') {
    return [
      {
        category: 'Traffic Management',
        actions: ['Increase public transport frequency', 'Promote carpooling advisories'],
        urgency: 'advisory',
      },
      {
        category: 'Dust Control',
        actions: ['Intensify road sweeping', 'Water sprinkling in dusty areas'],
        urgency: 'recommended',
      },
    ];
  }
  
  if (category === 'poor') {
    return [
      {
        category: 'Traffic Regulation',
        actions: [
          'Consider odd-even restrictions',
          'Increase parking fees in congested areas',
          'Deploy traffic marshals',
        ],
        urgency: 'recommended',
      },
      {
        category: 'Construction Control',
        actions: [
          'Mandate dust barriers at all sites',
          'Restrict construction during peak hours',
          'Ensure material transport in covered vehicles',
        ],
        urgency: 'recommended',
      },
      {
        category: 'Industrial Compliance',
        actions: ['Inspect industrial emission compliance', 'Penalize violators'],
        urgency: 'recommended',
      },
    ];
  }
  
  // Very Poor or Severe
  return [
    {
      category: 'Emergency Traffic Measures',
      actions: [
        'Implement strict odd-even vehicle scheme',
        'Ban entry of heavy diesel vehicles',
        'Deploy additional metro/bus services',
        'Work-from-home advisory for non-essential sectors',
      ],
      urgency: 'immediate',
    },
    {
      category: 'Construction Ban',
      actions: [
        'Halt all construction activities',
        'Stop demolition work',
        'Ban stone crushing operations',
      ],
      urgency: 'immediate',
    },
    {
      category: 'Industrial Actions',
      actions: [
        'Shut down non-essential polluting industries',
        'Mandate emission control compliance',
        'Power plant load optimization',
      ],
      urgency: 'immediate',
    },
    {
      category: 'Public Health',
      actions: [
        'Issue health emergency advisories',
        'Schools to shift to online mode',
        'Open medical camps in high-risk areas',
        'Distribute masks to vulnerable populations',
      ],
      urgency: 'immediate',
    },
  ];
}

// ============= NCAP Target Comparison =============
export interface NCAPComparison {
  currentAQI: number;
  targetAQI: number;
  gap: number;
  progress: number; // percentage
  status: 'On Track' | 'Behind' | 'Critical';
  yearToAchieve: number;
}

export function getNCAPComparison(currentAQI: number): NCAPComparison {
  // NCAP targets 20-30% reduction by 2024-2026
  const baselineAQI = Math.round(currentAQI * 1.25); // Simulated 2017 baseline
  const targetAQI = Math.round(baselineAQI * 0.7); // 30% reduction target
  const gap = currentAQI - targetAQI;
  const totalReductionNeeded = baselineAQI - targetAQI;
  const reductionAchieved = baselineAQI - currentAQI;
  const progress = Math.min(100, Math.max(0, Math.round((reductionAchieved / totalReductionNeeded) * 100)));
  
  let status: NCAPComparison['status'] = 'On Track';
  if (progress < 30) status = 'Critical';
  else if (progress < 60) status = 'Behind';
  
  return {
    currentAQI,
    targetAQI,
    gap: Math.max(0, gap),
    progress,
    status,
    yearToAchieve: 2026,
  };
}

// ============= City Personality Labels =============
export function getCityPersonality(aqi: number, category: AQICategory): string {
  if (category === 'good') return 'Excellent air quality today';
  if (category === 'satisfactory') return 'Relatively breathable';
  if (category === 'moderate') return 'Moderate, watch for changes';
  if (category === 'poor') return 'Poor conditions, caution advised';
  if (category === 'very-poor') return 'High health risk today';
  return 'Emergency conditions';
}

// ============= Exposure Projection =============
export interface ExposureProjection {
  days: number;
  riskLevel: 'Minimal' | 'Low' | 'Moderate' | 'Elevated' | 'High';
  statement: string;
  disclaimer: string;
}

export function getExposureProjection(aqi: number, category: AQICategory): ExposureProjection {
  const days = 7;
  const disclaimer = 'Indicative projection based on current conditions. Actual health impact depends on individual factors.';
  
  if (category === 'good' || category === 'satisfactory') {
    return {
      days,
      riskLevel: 'Minimal',
      statement: 'Current air quality poses minimal long-term risk with 7-day exposure.',
      disclaimer,
    };
  }
  
  if (category === 'moderate') {
    return {
      days,
      riskLevel: 'Low',
      statement: 'If conditions persist for 7 days, sensitive individuals may experience mild respiratory symptoms.',
      disclaimer,
    };
  }
  
  if (category === 'poor') {
    return {
      days,
      riskLevel: 'Moderate',
      statement: 'Continued exposure over 7 days may lead to respiratory discomfort in general population.',
      disclaimer,
    };
  }
  
  if (category === 'very-poor') {
    return {
      days,
      riskLevel: 'Elevated',
      statement: 'If current conditions continue for 7 days, significant increase in respiratory issues expected. Medical resources should be on standby.',
      disclaimer,
    };
  }
  
  return {
    days,
    riskLevel: 'High',
    statement: 'CRITICAL: Prolonged exposure at this level poses serious health risk. Hospitalization rates may increase significantly.',
    disclaimer,
  };
}

// ============= Data Confidence Indicator =============
export type ConfidenceLevel = 'High' | 'Medium' | 'Simulated';

export function getConfidenceLevel(isLiveData: boolean = false): {
  level: ConfidenceLevel;
  label: string;
  description: string;
} {
  // For demo purposes, always show simulated
  return {
    level: 'Simulated',
    label: 'Simulated Data',
    description: 'Data simulated for demonstration. In production, this would reflect real CPCB readings.',
  };
}

// ============= Explain This AQI =============
export interface AQIExplanation {
  whatItMeans: string;
  whyItHappened: string;
  whatToDo: string[];
  healthEffects: string;
  duration: string;
}

export function explainAQI(aqi: number, category: AQICategory, dominantSource?: string): AQIExplanation {
  const source = dominantSource || 'mixed pollution sources';
  
  const explanations: Record<AQICategory, AQIExplanation> = {
    'good': {
      whatItMeans: 'Air quality is excellent. The air has minimal pollutants and is safe to breathe for everyone.',
      whyItHappened: 'Favorable weather conditions with good wind dispersion are keeping pollutant levels low.',
      whatToDo: ['Enjoy outdoor activities', 'Open windows for fresh air', 'Great day for exercise'],
      healthEffects: 'No health impacts expected for the general population.',
      duration: 'Conditions may vary throughout the day.',
    },
    'satisfactory': {
      whatItMeans: 'Air quality is acceptable. Most people will not experience health effects.',
      whyItHappened: 'Moderate levels of emissions with adequate atmospheric dispersion.',
      whatToDo: ['Normal activities are fine', 'Sensitive individuals should monitor symptoms'],
      healthEffects: 'Very sensitive individuals might experience mild discomfort.',
      duration: 'Expected to remain stable unless weather changes.',
    },
    'moderate': {
      whatItMeans: 'Air has noticeable pollutants. While not dangerous for most, it may affect sensitive groups.',
      whyItHappened: `Elevated emissions from ${source} with moderate atmospheric mixing.`,
      whatToDo: ['Limit prolonged outdoor exposure', 'Sensitive groups should reduce outdoor activity', 'Consider wearing a mask'],
      healthEffects: 'Children, elderly, and those with respiratory issues may feel discomfort.',
      duration: 'Monitor for improvement, typically improves with better weather.',
    },
    'poor': {
      whatItMeans: 'Air quality is unhealthy. Most people may experience breathing discomfort on prolonged exposure.',
      whyItHappened: `High pollution from ${source} combined with poor wind conditions trapping pollutants.`,
      whatToDo: ['Wear N95 mask outdoors', 'Keep windows closed', 'Use air purifiers', 'Avoid outdoor exercise'],
      healthEffects: 'May cause breathing difficulties, coughing, and eye irritation.',
      duration: 'Typically persists for 1-2 days unless weather improves.',
    },
    'very-poor': {
      whatItMeans: 'Air is very unhealthy. Health alert: serious health effects possible for everyone.',
      whyItHappened: `Severe pollution from ${source} with temperature inversion preventing pollutant dispersion.`,
      whatToDo: ['Stay indoors', 'Seal windows', 'N95 mask mandatory if outside', 'Avoid all outdoor activity'],
      healthEffects: 'Respiratory illness likely on prolonged exposure. May affect even healthy individuals.',
      duration: 'May persist for several days. Follow GRAP guidelines.',
    },
    'severe': {
      whatItMeans: 'HEALTH EMERGENCY. Everyone may experience serious health effects.',
      whyItHappened: `Emergency pollution levels from ${source} with complete atmospheric stagnation.`,
      whatToDo: ['Do not go outdoors', 'Seal all openings', 'Run air purifier', 'Keep emergency medicines ready'],
      healthEffects: 'Serious respiratory and cardiovascular impacts. Seek immediate medical help if symptoms occur.',
      duration: 'Emergency conditions may last multiple days. Follow government advisories.',
    },
  };
  
  return explanations[category];
}

// ============= Clean Air Escape Suggestions =============
export interface CleanAirSuggestion {
  name: string;
  distance: string;
  currentAQI: number;
  improvement: number;
  category: AQICategory;
}

export function getCleanAirSuggestions(
  currentAQI: number,
  nearbyLocations: { name: string; aqi: number; category: AQICategory }[]
): CleanAirSuggestion[] {
  return nearbyLocations
    .filter(loc => loc.aqi < currentAQI)
    .map(loc => ({
      name: loc.name,
      distance: `${Math.floor(Math.random() * 20 + 5)} km`,
      currentAQI: loc.aqi,
      improvement: currentAQI - loc.aqi,
      category: loc.category,
    }))
    .sort((a, b) => a.currentAQI - b.currentAQI)
    .slice(0, 5);
}

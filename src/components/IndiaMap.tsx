import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { statesData, getAQIColor, State, City } from '@/data/pollutionData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IndiaMapProps {
  onStateClick?: (state: State | null) => void;
  onCityClick?: (city: City) => void;
  selectedStateId?: string;
  className?: string;
}

// Component to handle map view changes
function MapController({ selectedStateId }: { selectedStateId?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedStateId) {
      const state = statesData.find(s => s.id === selectedStateId);
      if (state) {
        map.flyTo([state.coordinates[1], state.coordinates[0]], 7, { duration: 1.5 });
      }
    } else {
      map.flyTo([22.5937, 78.9629], 4.5, { duration: 1.5 });
    }
  }, [selectedStateId, map]);
  
  return null;
}

export function IndiaMap({ onStateClick, onCityClick, selectedStateId, className }: IndiaMapProps) {
  const markers = useMemo(() => {
    if (selectedStateId) {
      const state = statesData.find(s => s.id === selectedStateId);
      if (!state) return [];
      
      return state.cities.map(city => ({
        id: city.id,
        name: city.name,
        position: [city.coordinates[1], city.coordinates[0]] as [number, number],
        aqi: city.aqi,
        category: city.category,
        color: getAQIColor(city.category),
        isCity: true,
        data: city,
      }));
    }
    
    return statesData.map(state => ({
      id: state.id,
      name: state.name,
      position: [state.coordinates[1], state.coordinates[0]] as [number, number],
      aqi: state.aqi,
      category: state.category,
      color: getAQIColor(state.category),
      isCity: false,
      data: state,
    }));
  }, [selectedStateId]);

  const handleMarkerClick = (marker: typeof markers[0]) => {
    if (marker.isCity) {
      onCityClick?.(marker.data as City);
    } else {
      onStateClick?.(marker.data as State);
    }
  };

  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={4.5}
        minZoom={3}
        maxZoom={12}
        className="w-full h-full min-h-[400px] bg-background"
        style={{ background: 'hsl(var(--background))' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedStateId={selectedStateId} />
        
        {markers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={marker.position}
            radius={marker.isCity ? 12 : 18}
            pathOptions={{
              fillColor: marker.color,
              fillOpacity: 0.85,
              color: marker.color,
              weight: 2,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={0.95}
              className="custom-tooltip"
            >
              <div className="text-center font-sans">
                <div className="font-semibold text-sm">{marker.name}</div>
                <div className="text-xs mt-1">
                  AQI: <span className="font-bold" style={{ color: marker.color }}>{marker.aqi}</span>
                </div>
                <div className="text-xs opacity-80 capitalize">{marker.category.replace('-', ' ')}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
        
        {/* AQI Value Labels on markers */}
        {markers.map((marker) => (
          <CircleMarker
            key={`label-${marker.id}`}
            center={marker.position}
            radius={0}
            pathOptions={{ opacity: 0, fillOpacity: 0 }}
          >
            <Tooltip 
              permanent 
              direction="center"
              className="aqi-label-tooltip"
            >
              <span className="font-bold text-white text-xs cursor-pointer" onClick={() => handleMarkerClick(marker)}>
                {marker.aqi}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* AQI Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 z-[1000]">
        <p className="text-xs font-medium text-muted-foreground mb-2">AQI Scale (CPCB)</p>
        <div className="flex gap-1">
          {[
            { label: 'Good', color: 'bg-aqi-good' },
            { label: 'Satisfactory', color: 'bg-aqi-satisfactory' },
            { label: 'Moderate', color: 'bg-aqi-moderate' },
            { label: 'Poor', color: 'bg-aqi-poor' },
            { label: 'Very Poor', color: 'bg-aqi-very-poor' },
            { label: 'Severe', color: 'bg-aqi-severe' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className={cn('w-6 h-3 rounded-sm', item.color)} />
              <span className="text-[10px] text-muted-foreground mt-1 hidden lg:block">
                {item.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {selectedStateId && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 left-4 z-[1000]"
          onClick={() => onStateClick?.(null)}
        >
          ← Back to India
        </Button>
      )}
    </div>
  );
}

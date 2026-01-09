import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Map, Hash, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { AQIBadge } from '@/components/AQIBadge';
import { statesData, getAllCities, State, City, Ward } from '@/data/pollutionData';

interface SearchResult {
  type: 'state' | 'city' | 'ward' | 'pincode';
  id: string;
  name: string;
  subtitle: string;
  category: any;
  path: string;
}

// Mock pincode mapping for demo
const pincodeMapping: Record<string, { cityId: string; wardId?: string; name: string }> = {
  '110001': { cityId: 'new-delhi', wardId: 'ito', name: 'Connaught Place, Delhi' },
  '110085': { cityId: 'new-delhi', wardId: 'rohini', name: 'Rohini, Delhi' },
  '110059': { cityId: 'new-delhi', wardId: 'dwarka', name: 'Dwarka, Delhi' },
  '400001': { cityId: 'mumbai', wardId: 'colaba', name: 'Fort, Mumbai' },
  '400050': { cityId: 'mumbai', wardId: 'bandra', name: 'Bandra, Mumbai' },
  '400053': { cityId: 'mumbai', wardId: 'andheri', name: 'Andheri, Mumbai' },
  '560001': { cityId: 'bengaluru', wardId: 'koramangala', name: 'MG Road, Bengaluru' },
  '560034': { cityId: 'bengaluru', wardId: 'jayanagar', name: 'Jayanagar, Bengaluru' },
  '600001': { cityId: 'chennai', wardId: 't-nagar', name: 'T. Nagar, Chennai' },
  '600020': { cityId: 'chennai', wardId: 'adyar', name: 'Adyar, Chennai' },
  '700001': { cityId: 'kolkata', wardId: 'park-street', name: 'BBD Bagh, Kolkata' },
  '226001': { cityId: 'lucknow', wardId: 'hazratganj', name: 'Hazratganj, Lucknow' },
  '302001': { cityId: 'jaipur', wardId: 'malviya-nagar', name: 'Pink City, Jaipur' },
  '380001': { cityId: 'ahmedabad', wardId: 'satellite', name: 'Ahmedabad Old City' },
  '411001': { cityId: 'pune', wardId: 'shivaji-nagar', name: 'Shivaji Nagar, Pune' },
  '201301': { cityId: 'noida', wardId: 'sector-62', name: 'Sector 62, Noida' },
  '500001': { cityId: 'hyderabad', name: 'Hyderabad GPO' },
  '682001': { cityId: 'kochi', name: 'Kochi Fort' },
  '751001': { cityId: 'bhubaneswar', name: 'Bhubaneswar GPO' },
  '160001': { cityId: 'chandigarh', name: 'Sector 17, Chandigarh' },
};

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isExpanded?: boolean;
}

export function GlobalSearch({ className, placeholder = "Search cities, states, wards, pincodes...", onClose, isExpanded = false }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      const searchResults: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Search pincodes first (exact match)
      if (/^\d{6}$/.test(query)) {
        const pincodeResult = pincodeMapping[query];
        if (pincodeResult) {
          const city = getAllCities().find(c => c.id === pincodeResult.cityId);
          if (city) {
            searchResults.push({
              type: 'pincode',
              id: pincodeResult.wardId || pincodeResult.cityId,
              name: `📍 ${query}`,
              subtitle: pincodeResult.name,
              category: city.category,
              path: pincodeResult.wardId ? `/ward/${pincodeResult.wardId}` : `/city/${pincodeResult.cityId}`,
            });
          }
        }
      }

      // Search states
      statesData.forEach(state => {
        if (state.name.toLowerCase().includes(queryLower) || 
            state.code.toLowerCase().includes(queryLower)) {
          searchResults.push({
            type: 'state',
            id: state.id,
            name: state.name,
            subtitle: `${state.cities.length} cities • ${state.code}`,
            category: state.category,
            path: `/map?state=${state.id}`,
          });
        }

        // Search cities within state
        state.cities.forEach(city => {
          if (city.name.toLowerCase().includes(queryLower)) {
            searchResults.push({
              type: 'city',
              id: city.id,
              name: city.name,
              subtitle: `${state.name} • ${city.wards.length} wards`,
              category: city.category,
              path: `/city/${city.id}`,
            });
          }

          // Search wards within city
          city.wards.forEach(ward => {
            if (ward.name.toLowerCase().includes(queryLower)) {
              searchResults.push({
                type: 'ward',
                id: ward.id,
                name: ward.name,
                subtitle: `${city.name}, ${state.name}`,
                category: ward.category,
                path: `/ward/${ward.id}`,
              });
            }
          });
        });
      });

      // Limit results
      setResults(searchResults.slice(0, 10));
      setIsSearching(false);
      setShowResults(true);
    }, 150);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setQuery('');
    setShowResults(false);
    onClose?.();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'state': return <Map className="w-4 h-4 text-primary" />;
      case 'city': return <Building2 className="w-4 h-4 text-info" />;
      case 'ward': return <MapPin className="w-4 h-4 text-accent" />;
      case 'pincode': return <Hash className="w-4 h-4 text-success" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-border/50">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-secondary/50">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <AQIBadge category={result.category} size="sm" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for a city, state, ward, or pincode</p>
              </div>
            )}

            {/* Search Tips */}
            <div className="p-2 bg-secondary/30 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                💡 Tip: Enter 6-digit pincode for precise location search
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

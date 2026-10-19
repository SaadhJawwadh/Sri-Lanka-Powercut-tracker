/**
 * SearchBar Component
 * Omni-search with instant auto-suggestions across Sri Lanka towns,
 * Grid Substations, feeder numbers, and districts.
 * Includes full keyboard navigation (ArrowUp/ArrowDown/Enter/Escape) and ARIA combobox semantics.
 */

import React, { useState, useRef, useEffect } from 'react';
import { GridSubstation, GROUP_COLORS } from '../data/powerCutData';
import { Search, MapPin, Zap, X, ChevronRight, Hash } from 'lucide-react';

interface SearchBarProps {
  substations: GridSubstation[];
  onSelectStation: (station: GridSubstation) => void;
  selectedStation: GridSubstation | null;
}

interface SearchResult {
  station: GridSubstation;
  matchType: 'station' | 'town' | 'feeder' | 'district';
  matchLabel: string;
  matchedFeeder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  substations,
  onSelectStation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results: SearchResult[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list: SearchResult[] = [];

    const feederRegex = /^(?:feeder\s*|f\s*)([a-z0-9-]+)$/i;
    const feederMatch = q.match(feederRegex);
    const feederQuery = feederMatch ? feederMatch[1].toLowerCase() : q;

    substations.forEach((station) => {
      const stationNameLower = station.name.toLowerCase();
      const displayNameLower = station.displayName.toLowerCase();
      const districtLower = station.district.toLowerCase();

      if (stationNameLower.includes(q) || displayNameLower.includes(q)) {
        list.push({
          station,
          matchType: 'station',
          matchLabel: station.displayName,
        });
        return;
      }

      const matchedTown = station.townAliases.find((t) => t.toLowerCase().includes(q));
      if (matchedTown) {
        list.push({
          station,
          matchType: 'town',
          matchLabel: matchedTown,
        });
        return;
      }

      for (const grp of station.groupFeeders) {
        const matchingFeeder = grp.feeders.find(
          (f) => f.toLowerCase() === feederQuery || f.toLowerCase().includes(feederQuery)
        );
        if (matchingFeeder) {
          list.push({
            station,
            matchType: 'feeder',
            matchLabel: `Feeder ${matchingFeeder} (Group ${grp.group})`,
            matchedFeeder: matchingFeeder,
          });
          return;
        }
      }

      if (districtLower.includes(q)) {
        list.push({
          station,
          matchType: 'district',
          matchLabel: `${station.district} District`,
        });
      }
    });

    return list.slice(0, 8);
  }, [query, substations]);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  const handleSelect = (station: GridSubstation) => {
    onSelectStation(station);
    setQuery(station.displayName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex].station);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const quickCities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Dehiwala', 'Kelaniya', 'Kurunegala'];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="substation-search-listbox"
          aria-autocomplete="list"
          aria-label="Search by Sri Lankan city, town, Grid Substation, or feeder number"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by city, town (e.g. Mount Lavinia), substation, or feeder..."
          className="w-full pl-11 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-500/60 focus:border-rose-500/80 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-3.5 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Quick Search Buttons */}
      {!query && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto py-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] whitespace-nowrap pl-1">Quick:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city);
                setIsOpen(true);
              }}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Auto-suggest dropdown */}
      {isOpen && results.length > 0 && (
        <div
          id="substation-search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-[380px] overflow-y-auto"
        >
          <div className="p-2 space-y-1">
            {results.map((res, idx) => {
              const primaryGroup = res.station.groupFeeders[0]?.group || 1;
              const groupColor = GROUP_COLORS[primaryGroup];
              const isHighlighted = idx === activeIndex;

              return (
                <button
                  key={`${res.station.id}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleSelect(res.station)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors group ${
                    isHighlighted ? 'bg-slate-800/90' : 'hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: groupColor.bgRgba,
                        borderColor: `${groupColor.hex}40`,
                      }}
                    >
                      {res.matchType === 'feeder' ? (
                        <Hash className="w-4 h-4" style={{ color: groupColor.hex }} aria-hidden="true" />
                      ) : res.matchType === 'town' ? (
                        <MapPin className="w-4 h-4" style={{ color: groupColor.hex }} aria-hidden="true" />
                      ) : (
                        <Zap className="w-4 h-4" style={{ color: groupColor.hex }} aria-hidden="true" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
                        <span>{res.station.displayName}</span>
                        {res.matchType === 'town' && (
                          <span className="text-xs text-rose-400 font-normal">
                            (via {res.matchLabel})
                          </span>
                        )}
                        {res.matchType === 'feeder' && (
                          <span className="text-xs text-amber-400 font-mono font-medium">
                            ({res.matchLabel})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{res.station.district} District</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Groups: {res.station.groupFeeders.map((g) => `0${g.group}`).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs font-semibold font-mono"
                      style={{ color: groupColor.hex }}
                    >
                      {groupColor.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && results.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-center"
        >
          <p className="text-sm text-slate-300">No Grid Substation or town found matching &quot;{query}&quot;</p>
          <p className="text-xs text-slate-500 mt-1">
            Try searching for nearby major towns like Colombo, Kandy, Galle, Ratnapura, or Kurunegala.
          </p>
        </div>
      )}
    </div>
  );
};

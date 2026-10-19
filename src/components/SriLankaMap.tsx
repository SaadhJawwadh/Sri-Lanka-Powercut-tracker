/**
 * SriLankaMap Component
 * Interactive vector SVG map of Sri Lanka with all 25 districts,
 * CEB Grid Substations, real-time power outage halos, pan/zoom (mouse + touch),
 * and full keyboard/ARIA accessibility.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  GridSubstation,
  GROUP_COLORS,
  getSubstationStatus,
} from '../data/powerCutData';
import { ZoomIn, ZoomOut, RotateCcw, Zap, AlertTriangle, Layers } from 'lucide-react';

interface SriLankaMapProps {
  substations: GridSubstation[];
  selectedStation: GridSubstation | null;
  onSelectStation: (station: GridSubstation) => void;
  selectedDate: string;
  currentHourFloat: number;
  highlightedStationId?: string | null;
  colorMode: 'status' | 'group';
  onChangeColorMode: (mode: 'status' | 'group') => void;
  selectedGroupFilter: number | 'all';
  onChangeGroupFilter: (group: number | 'all') => void;
}

interface DistrictShape {
  id: string;
  name: string;
  province: string;
  path: string;
  labelX: number;
  labelY: number;
}

const SRI_LANKA_DISTRICTS: DistrictShape[] = [
  // Northern Province
  {
    id: "jaffna",
    name: "Jaffna",
    province: "Northern",
    path: "M 125,50 C 135,32 170,22 190,26 C 215,30 230,45 220,60 C 205,75 180,72 165,78 C 150,85 135,70 125,50 Z",
    labelX: 170,
    labelY: 48,
  },
  {
    id: "kilinochchi",
    name: "Kilinochchi",
    province: "Northern",
    path: "M 150,85 C 175,76 210,75 225,85 C 240,95 242,120 220,130 C 190,135 160,125 150,105 Z",
    labelX: 190,
    labelY: 105,
  },
  {
    id: "mannar",
    name: "Mannar",
    province: "Northern",
    path: "M 105,175 C 90,165 110,130 145,115 C 165,130 170,160 160,195 C 135,210 115,195 105,175 Z",
    labelX: 130,
    labelY: 160,
  },
  {
    id: "mullaitivu",
    name: "Mullaitivu",
    province: "Northern",
    path: "M 220,130 C 245,120 270,135 285,160 C 275,185 245,190 225,180 C 215,165 210,145 220,130 Z",
    labelX: 250,
    labelY: 155,
  },
  {
    id: "vavuniya",
    name: "Vavuniya",
    province: "Northern",
    path: "M 165,185 C 200,175 225,180 235,205 C 230,230 195,240 170,225 C 160,205 160,195 165,185 Z",
    labelX: 198,
    labelY: 205,
  },

  // North Central Province
  {
    id: "anuradhapura",
    name: "Anuradhapura",
    province: "North Central",
    path: "M 140,215 C 175,200 230,215 255,235 C 270,270 260,310 220,335 C 170,330 140,290 130,255 C 125,235 135,220 140,215 Z",
    labelX: 195,
    labelY: 270,
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    province: "North Central",
    path: "M 255,240 C 285,240 310,265 315,310 C 310,345 275,365 250,350 C 240,325 245,280 255,240 Z",
    labelX: 280,
    labelY: 300,
  },

  // North Western Province
  {
    id: "puttalam",
    name: "Puttalam",
    province: "North Western",
    path: "M 95,205 C 125,215 135,260 130,310 C 125,355 105,390 90,380 C 80,330 85,250 95,205 Z",
    labelX: 108,
    labelY: 290,
  },
  {
    id: "kurunegala",
    name: "Kurunegala",
    province: "North Western",
    path: "M 130,315 C 165,310 205,325 210,365 C 215,405 180,435 140,430 C 125,400 120,355 130,315 Z",
    labelX: 168,
    labelY: 375,
  },

  // Eastern Province
  {
    id: "trincomalee",
    name: "Trincomalee",
    province: "Eastern",
    path: "M 280,165 C 310,185 330,230 325,280 C 305,280 285,260 275,230 C 270,200 275,180 280,165 Z",
    labelX: 302,
    labelY: 225,
  },
  {
    id: "batticaloa",
    name: "Batticaloa",
    province: "Eastern",
    path: "M 320,290 C 345,310 365,365 360,420 C 340,420 320,380 315,340 C 315,310 318,295 320,290 Z",
    labelX: 342,
    labelY: 355,
  },
  {
    id: "ampara",
    name: "Ampara",
    province: "Eastern",
    path: "M 315,370 C 345,370 375,415 370,480 C 345,510 300,500 285,465 C 285,420 295,385 315,370 Z",
    labelX: 335,
    labelY: 450,
  },

  // Central Province
  {
    id: "matale",
    name: "Matale",
    province: "Central",
    path: "M 215,330 C 245,325 260,350 255,395 C 235,420 215,415 205,380 C 205,355 210,340 215,330 Z",
    labelX: 232,
    labelY: 370,
  },
  {
    id: "kandy",
    name: "Kandy",
    province: "Central",
    path: "M 195,400 C 225,390 255,410 260,450 C 245,475 205,480 185,455 C 180,430 185,410 195,400 Z",
    labelX: 225,
    labelY: 435,
  },
  {
    id: "nuwaraeliya",
    name: "Nuwara Eliya",
    province: "Central",
    path: "M 205,460 C 245,450 265,475 265,520 C 240,545 200,540 190,505 C 190,480 195,465 205,460 Z",
    labelX: 228,
    labelY: 498,
  },

  // Western Province
  {
    id: "gampaha",
    name: "Gampaha",
    province: "Western",
    path: "M 95,400 C 130,400 150,425 145,465 C 120,475 95,460 90,435 C 88,415 90,405 95,400 Z",
    labelX: 118,
    labelY: 435,
  },
  {
    id: "colombo",
    name: "Colombo",
    province: "Western",
    path: "M 92,465 C 115,465 145,470 145,505 C 125,525 98,515 90,490 C 88,475 90,470 92,465 Z",
    labelX: 115,
    labelY: 490,
  },
  {
    id: "kalutara",
    name: "Kalutara",
    province: "Western",
    path: "M 95,510 C 125,510 150,525 145,570 C 120,585 100,565 95,535 C 92,520 92,515 95,510 Z",
    labelX: 118,
    labelY: 545,
  },

  // Sabaragamuwa Province
  {
    id: "kegalle",
    name: "Kegalle",
    province: "Sabaragamuwa",
    path: "M 148,430 C 185,425 195,465 180,505 C 155,510 142,475 148,430 Z",
    labelX: 165,
    labelY: 465,
  },
  {
    id: "ratnapura",
    name: "Ratnapura",
    province: "Sabaragamuwa",
    path: "M 150,510 C 195,505 245,525 240,580 C 195,600 155,580 145,545 C 142,525 145,515 150,510 Z",
    labelX: 195,
    labelY: 550,
  },

  // Uva Province
  {
    id: "badulla",
    name: "Badulla",
    province: "Uva",
    path: "M 255,455 C 290,450 305,485 295,540 C 270,555 245,535 250,495 C 250,475 252,460 255,455 Z",
    labelX: 275,
    labelY: 495,
  },
  {
    id: "monaragala",
    name: "Monaragala",
    province: "Uva",
    path: "M 275,525 C 315,505 345,540 330,600 C 290,620 265,585 270,550 C 270,535 272,530 275,525 Z",
    labelX: 300,
    labelY: 570,
  },

  // Southern Province
  {
    id: "galle",
    name: "Galle",
    province: "Southern",
    path: "M 105,570 C 145,565 165,600 150,640 C 125,645 105,620 105,570 Z",
    labelX: 130,
    labelY: 605,
  },
  {
    id: "matara",
    name: "Matara",
    province: "Southern",
    path: "M 152,600 C 190,595 205,630 190,655 C 160,660 145,635 152,600 Z",
    labelX: 172,
    labelY: 630,
  },
  {
    id: "hambantota",
    name: "Hambantota",
    province: "Southern",
    path: "M 195,600 C 255,590 295,615 285,650 C 235,660 195,645 195,600 Z",
    labelX: 240,
    labelY: 625,
  },
];

export const SriLankaMap: React.FC<SriLankaMapProps> = ({
  substations,
  selectedStation,
  onSelectStation,
  selectedDate,
  currentHourFloat,
  highlightedStationId,
  colorMode,
  onChangeColorMode,
  selectedGroupFilter,
  onChangeGroupFilter,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<GridSubstation | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictShape | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (selectedStation) {
      const targetX = selectedStation.svgX;
      const targetY = selectedStation.svgY;
      const svgCenterX = 230;
      const svgCenterY = 350;
      setZoom(1.8);
      setPan({
        x: (svgCenterX - targetX) * 1.5,
        y: (svgCenterY - targetY) * 1.5,
      });
    }
  }, [selectedStation]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.4, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.4, 0.8));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers for mobile responsiveness
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Check if a station belongs to the currently selected group filter
  const stationMatchesGroupFilter = (station: GridSubstation): boolean => {
    if (selectedGroupFilter === 'all') return true;
    return station.groupFeeders.some((g) => g.group === selectedGroupFilter);
  };

  // Determine station visuals based on mode and active group filter
  const getStationVisuals = (station: GridSubstation) => {
    const status = getSubstationStatus(station, selectedDate, currentHourFloat);
    const stationGroups = station.groupFeeders.map((g) => g.group);
    const matchesFilter = stationMatchesGroupFilter(station);

    // If a specific group filter (1, 2, 3, or 4) is active, highlight matching stations in that group's color
    if (selectedGroupFilter !== 'all') {
      const targetColor = GROUP_COLORS[selectedGroupFilter];
      const secondaryGrp = stationGroups.find((g) => g !== selectedGroupFilter);
      return {
        fill: matchesFilter ? targetColor.hex : '#334155',
        stroke: matchesFilter
          ? secondaryGrp
            ? GROUP_COLORS[secondaryGrp].hex
            : '#FFFFFF'
          : '#475569',
        thirdGroupHex: undefined as string | undefined,
        halo: matchesFilter ? targetColor.bgRgba : 'transparent',
        isPulsing: matchesFilter && status.state === 'cut_active',
        label: matchesFilter
          ? `${targetColor.name} (${status.state === 'cut_active' ? 'Cut Active' : 'Scheduled'})`
          : `Not in ${targetColor.name}`,
        dimmed: !matchesFilter,
      };
    }

    if (colorMode === 'status') {
      if (status.state === 'cut_active') {
        return {
          fill: '#F43F5E', // Rose 500
          stroke: '#FFE4E6',
          thirdGroupHex: undefined as string | undefined,
          halo: 'rgba(244, 63, 94, 0.45)',
          isPulsing: true,
          label: `Power Cut Active (Group 0${status.activeGroup})`,
          dimmed: false,
        };
      }
      if (status.state === 'cut_approaching') {
        return {
          fill: '#F59E0B', // Amber 500
          stroke: '#FEF3C7',
          thirdGroupHex: undefined as string | undefined,
          halo: 'rgba(245, 158, 11, 0.35)',
          isPulsing: true,
          label: 'Cut in < 45m',
          dimmed: false,
        };
      }
      return {
        fill: '#10B981', // Emerald 500
        stroke: '#D1FAE5',
        thirdGroupHex: undefined as string | undefined,
        halo: 'rgba(16, 185, 129, 0.15)',
        isPulsing: false,
        label: 'Power Active',
        dimmed: false,
      };
    }

    // By Group ("All Groups" mode) — accurately show multi-group stations with dual/triple group rings
    const firstGroup = stationGroups[0] || 1;
    const secondGroup = stationGroups[1];
    const thirdGroup = stationGroups[2];
    const firstColor = GROUP_COLORS[firstGroup];
    const secondColor = secondGroup ? GROUP_COLORS[secondGroup] : null;
    const thirdColor = thirdGroup ? GROUP_COLORS[thirdGroup] : null;

    return {
      fill: firstColor.hex,
      stroke: secondColor ? secondColor.hex : '#FFFFFF',
      thirdGroupHex: thirdColor?.hex,
      halo: firstColor.bgRgba,
      isPulsing: status.state === 'cut_active',
      label: `Groups ${stationGroups.map((g) => `0${g}`).join(', ')}`,
      dimmed: false,
    };
  };

  const activeCutCount = substations.filter(
    (s) => getSubstationStatus(s, selectedDate, currentHourFloat).state === 'cut_active'
  ).length;

  const matchingGroupStationCount =
    selectedGroupFilter === 'all'
      ? substations.length
      : substations.filter((s) => s.groupFeeders.some((g) => g.group === selectedGroupFilter)).length;

  return (
    <div
      role="region"
      aria-label="Interactive Sri Lanka Grid Substation Map"
      className="relative w-full h-full min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col bg-[#080C14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl"
    >
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Color Mode Switcher */}
          <div
            role="group"
            aria-label="Map Color Mode"
            className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                onChangeColorMode('status');
                onChangeGroupFilter('all');
              }}
              aria-pressed={colorMode === 'status' && selectedGroupFilter === 'all'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                colorMode === 'status' && selectedGroupFilter === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
              <span>Power Cut Status</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeColorMode('group')}
              aria-pressed={colorMode === 'group'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                colorMode === 'group'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>Feeder Groups (1–4)</span>
            </button>
          </div>

          {/* Live Cut / Group Match Indicator Status */}
          <div
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg text-xs"
          >
            {selectedGroupFilter !== 'all' ? (
              <>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[selectedGroupFilter].hex }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-white font-mono tabular-nums">
                  {matchingGroupStationCount}
                </span>
                <span className="text-slate-300">
                  Substations in {GROUP_COLORS[selectedGroupFilter].name}
                </span>
              </>
            ) : activeCutCount > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" aria-hidden="true" />
                <span className="font-semibold text-rose-400 font-mono tabular-nums">
                  {activeCutCount}
                </span>
                <span className="text-slate-300">Substations Affected Now</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-emerald-400 font-medium">All Grid Substations Powered</span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Group Location Filter Bar (All, Group 01, 02, 03, 04) */}
        <div
          role="group"
          aria-label="Filter Sri Lanka Map Locations by Outage Group"
          className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg w-fit overflow-x-auto max-w-full"
        >
          <button
            type="button"
            aria-pressed={selectedGroupFilter === 'all'}
            onClick={() => onChangeGroupFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selectedGroupFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-600/70'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Groups ({substations.length})
          </button>
          {([1, 2, 3, 4] as const).map((grp) => {
            const isSelected = selectedGroupFilter === grp;
            const grpStyle = GROUP_COLORS[grp];
            const count = substations.filter((s) =>
              s.groupFeeders.some((gf) => gf.group === grp)
            ).length;

            return (
              <button
                key={grp}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) {
                    onChangeGroupFilter('all');
                  } else {
                    onChangeGroupFilter(grp);
                    onChangeColorMode('group');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: grpStyle.hex }}
                  aria-hidden="true"
                />
                <span>G0{grp}</span>
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom In Map"
          title="Zoom In"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom Out Map"
          title="Zoom Out"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset Map View"
          title="Reset Map View"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Map Legend (Responsive & Interactive on both mobile & desktop) */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-[11px] shadow-xl max-w-[250px]">
        <div className="text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
          {colorMode === 'status' && selectedGroupFilter === 'all'
            ? 'Live Cut Legend'
            : 'CEB Group Legend (Click to Filter)'}
        </div>
        {colorMode === 'status' && selectedGroupFilter === 'all' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" aria-hidden="true" />
              <span className="text-slate-200">Power Cut Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" aria-hidden="true" />
              <span className="text-slate-200">Cut Impending (&lt; 45m)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-slate-300">Supply Normal</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {([1, 2, 3, 4] as const).map((grp) => {
                const isSelected = selectedGroupFilter === grp;
                const style = GROUP_COLORS[grp];
                return (
                  <button
                    key={grp}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      onChangeGroupFilter(isSelected ? 'all' : grp)
                    }
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-white ring-1 ring-slate-600'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: style.hex }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">Group 0{grp}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Dual-ring pins indicate stations with feeders across multiple groups.
            </div>
          </div>
        )}
      </div>

      {/* Main SVG Map Canvas with Mouse & Touch Panning */}
      <div
        className="w-full h-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 460 700"
          role="img"
          aria-label="Map of Sri Lanka showing 25 districts and 69 CEB Grid Substations"
          className="w-full h-full max-h-[700px] transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0E1626" />
              <stop offset="100%" stopColor="#080C14" />
            </radialGradient>
            <filter id="glowRose" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="460" height="700" fill="url(#oceanGlow)" />
          <rect width="460" height="700" fill="url(#gridPattern)" />

          {/* Sri Lanka Landmass Outline with District Group & Outage Illumination */}
          <g className="island-landmass">
            {SRI_LANKA_DISTRICTS.map((district) => {
              const isHovered = hoveredDistrict?.id === district.id;
              const districtStations = substations.filter(
                (s) => s.district.toLowerCase() === district.name.toLowerCase()
              );

              // Check if district has stations in selected group or active power cuts
              const hasGroupStation =
                selectedGroupFilter !== 'all' &&
                districtStations.some((s) =>
                  s.groupFeeders.some((g) => g.group === selectedGroupFilter)
                );

              const hasActiveCut =
                selectedGroupFilter === 'all' &&
                colorMode === 'status' &&
                districtStations.some(
                  (s) => getSubstationStatus(s, selectedDate, currentHourFloat).state === 'cut_active'
                );

              let fillStyle = isHovered ? '#1E293B' : '#0F172A';
              let strokeStyle = isHovered ? '#475569' : '#1E293B';

              if (hasGroupStation && typeof selectedGroupFilter === 'number') {
                fillStyle = GROUP_COLORS[selectedGroupFilter].bgRgba;
                strokeStyle = GROUP_COLORS[selectedGroupFilter].hex;
              } else if (hasActiveCut) {
                fillStyle = 'rgba(244, 63, 94, 0.14)';
                strokeStyle = 'rgba(244, 63, 94, 0.45)';
              }

              return (
                <path
                  key={district.id}
                  d={district.path}
                  fill={fillStyle}
                  stroke={strokeStyle}
                  strokeWidth={isHovered || hasGroupStation ? '1.5' : '1'}
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredDistrict(district)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
              );
            })}

            {SRI_LANKA_DISTRICTS.map((d) => (
              <text
                key={`label-${d.id}`}
                x={d.labelX}
                y={d.labelY}
                fill="rgba(148, 163, 184, 0.4)"
                fontSize="8"
                fontWeight="500"
                textAnchor="middle"
                className="pointer-events-none select-none tracking-wider"
              >
                {d.name.toUpperCase()}
              </text>
            ))}
          </g>

          {/* Transmission lines subtle connector hints */}
          <g stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" strokeDasharray="3,3" fill="none">
            <line x1="115" y1="485" x2="206" y2="432" />
            <line x1="206" y1="432" x2="182" y2="268" />
            <line x1="115" y1="485" x2="134" y2="626" />
            <line x1="182" y1="268" x2="168" y2="46" />
            <line x1="206" y1="432" x2="278" y2="312" />
            <line x1="278" y1="312" x2="308" y2="216" />
            <line x1="206" y1="432" x2="276" y2="502" />
          </g>

          {/* Grid Substation Pins (Keyboard & Screen-Reader Accessible) */}
          <g className="substation-pins">
            {substations.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              const isHighlighted = highlightedStationId === station.id;
              const isHovered = hoveredStation?.id === station.id;
              const visuals = getStationVisuals(station);

              return (
                <g
                  key={station.id}
                  transform={`translate(${station.svgX}, ${station.svgY})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${station.displayName} Grid Substation, ${station.district} District, ${visuals.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStation(station);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectStation(station);
                    }
                  }}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onFocus={() => setHoveredStation(station)}
                  onBlur={() => setHoveredStation(null)}
                  style={{ opacity: visuals.dimmed && !isHovered && !isSelected ? 0.16 : 1 }}
                  className="cursor-pointer group focus:outline-none transition-opacity duration-200"
                >
                  {visuals.isPulsing && (
                    <circle
                      r={isSelected ? 18 : 12}
                      fill={visuals.halo}
                      className="animate-ping"
                      opacity="0.75"
                    />
                  )}

                  {(isSelected || isHighlighted) && (
                    <circle
                      r="14"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  <circle
                    r={isHovered ? 12 : isSelected ? 10 : 8}
                    fill={visuals.halo}
                    className="transition-all duration-200"
                  />

                  {/* Optional 3rd Group Outer Ring for 3-group substations (e.g. Kosgama, Wewelwatta) */}
                  {visuals.thirdGroupHex && (
                    <circle
                      r={isHovered ? 7.5 : isSelected ? 7 : 6}
                      fill="none"
                      stroke={visuals.thirdGroupHex}
                      strokeWidth="1.3"
                      strokeDasharray="2,1"
                    />
                  )}

                  {/* Primary & Secondary Group Concentric Pin */}
                  <circle
                    r={isHovered ? 5.5 : isSelected ? 5 : 4.2}
                    fill={visuals.fill}
                    stroke={visuals.stroke}
                    strokeWidth={colorMode === 'group' && station.groupFeeders.length > 1 ? '1.8' : '1.2'}
                    filter={visuals.isPulsing ? 'url(#glowRose)' : undefined}
                    className="transition-all duration-200"
                  />

                  {(zoom >= 1.5 || isSelected || isHovered || (selectedGroupFilter !== 'all' && !visuals.dimmed && zoom >= 1.2)) && (
                    <g transform="translate(0, -10)">
                      <rect
                        x="-34"
                        y="-14"
                        width="68"
                        height="13"
                        rx="3"
                        fill="rgba(15, 23, 42, 0.94)"
                        stroke="rgba(71, 85, 105, 0.7)"
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="-5"
                        fill="#F8FAFC"
                        fontSize="7.5"
                        fontWeight="600"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {station.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Info Tooltip Bar */}
      {hoveredStation && (
        <div
          role="status"
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs max-w-[92%]"
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate">{hoveredStation.displayName}</span>
              <span className="text-slate-400 text-[11px] shrink-0">({hoveredStation.district})</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300 mt-0.5">
              {hoveredStation.groupFeeders.map((gf) => (
                <span
                  key={gf.group}
                  className="inline-flex items-center gap-1 font-mono"
                  style={{ color: GROUP_COLORS[gf.group].hex }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: GROUP_COLORS[gf.group].hex }}
                  />
                  <span>
                    G0{gf.group}: [{gf.feeders.join(', ')}]
                  </span>
                </span>
              ))}
            </div>
          </div>

          {(() => {
            const status = getSubstationStatus(hoveredStation, selectedDate, currentHourFloat);
            if (status.state === 'cut_active') {
              return (
                <div className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg font-mono text-[11px] flex items-center gap-1.5 font-semibold shrink-0">
                  <Zap className="w-3 h-3 text-rose-400" aria-hidden="true" />
                  <span>Cut Active ({status.minutesRemaining}m left)</span>
                </div>
              );
            }
            if (status.state === 'cut_approaching') {
              return (
                <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg font-mono text-[11px] flex items-center gap-1.5 font-semibold shrink-0">
                  <AlertTriangle className="w-3 h-3 text-amber-400" aria-hidden="true" />
                  <span>Cut in {status.minutesUntilCut}m</span>
                </div>
              );
            }
            return (
              <div className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-mono text-[11px] flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                <span>Normal Power</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

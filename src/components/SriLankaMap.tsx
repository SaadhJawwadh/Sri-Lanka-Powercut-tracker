/**
 * SriLankaMap Component
 * Interactive vector SVG map of Sri Lanka with all 25 districts,
 * CEB Grid Substations, real-time power outage halos, pan/zoom (mouse + touch),
 * and full keyboard/ARIA accessibility.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
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

// Authentic 96-point projected coastline of Sri Lanka (Point Pedro -> Trincomalee -> Batticaloa -> Sangamankanda -> Hambantota -> Dondra Head -> Galle -> Colombo -> Kalpitiya -> Mannar -> Jaffna Lagoon)
const SRI_LANKA_MAIN_COASTLINE_PATH =
  "M 152.3,50.2 L 158.1,52.6 L 163.8,57.2 L 171,66.7 L 180.7,78.3 L 188.4,88.7 L 199.5,98.2 L 207.2,103.3 L 218.3,114.3 L 230.8,125.2 L 241.8,136.5 L 250.1,151.3 L 256.8,165.3 L 262.6,177.3 L 270.7,189.7 L 281.8,204.3 L 295.3,219.2 L 301,232.7 L 303.1,240.3 L 298.2,245.7 L 302.1,250.2 L 314,248.7 L 320.4,260.7 L 325.2,277.2 L 329.1,295.2 L 332.4,310.2 L 342.5,328.2 L 350.2,338.7 L 358.4,352.2 L 368.9,368.8 L 376.7,385.2 L 384,403.2 L 389.2,419.7 L 392,437.8 L 393.5,455.8 L 395.1,474.2 L 392,490.3 L 388.7,502.2 L 382.5,520.3 L 374.3,539.8 L 361.3,557.8 L 346.4,574.8 L 329.1,590.8 L 310.3,603.3 L 290.1,614.3 L 272.7,618.7 L 255.8,622.8 L 238.5,627.9 L 223.1,634.3 L 207,642.8 L 195.1,639.2 L 182.1,635.3 L 167.6,632.3 L 151,626.6 L 140.6,617.8 L 132.4,607.3 L 125.2,592.8 L 120.8,577.8 L 116.9,562.8 L 111.2,541.8 L 102.5,522.3 L 94.2,507.2 L 92.6,488.3 L 93.2,470.8 L 93.8,448.2 L 93.4,422.7 L 89.6,391.2 L 87.6,359.7 L 83.3,329.7 L 81.8,305.8 L 84.7,291.2 L 89.6,302.8 L 94,320.7 L 97.3,299.7 L 99.2,274.2 L 101.6,246.8 L 104.9,220.2 L 106.8,194.7 L 106.4,179.2 L 117.5,171.7 L 125.7,154.7 L 129.5,135.2 L 129.5,117.7 L 144.9,102.3 L 166.6,96.2 L 172.4,90.3 L 155.1,83.7 L 131.9,79.7 L 120.4,78.2 L 111.7,68.7 L 117.5,57.2 L 129.1,52.2 L 141.6,50.7 Z";

const MANNAR_ISLAND_PATH =
  "M 79.2,159.5 L 96.7,164.5 L 112.5,178.5 L 110.2,186.5 L 89.9,174 L 78.2,165.5 Z";

const KAYTS_ISLAND_PATH =
  "M 96.6,65.5 L 109.1,67 L 110.6,83 L 99,86 L 94.7,75.5 Z";

const SRI_LANKA_DISTRICTS: DistrictShape[] = [
  {
    id: "jaffna",
    name: "Jaffna",
    province: "Northern",
    path: "M 92.8,48.5 L 182.3,48.5 L 182.3,99.5 L 92.8,99.5 Z",
    labelX: 139,
    labelY: 69,
  },
  {
    id: "kilinochchi",
    name: "Kilinochchi",
    province: "Northern",
    path: "M 124.6,95 L 211.2,95 L 196.8,144.5 L 124.6,144.5 Z",
    labelX: 170,
    labelY: 118,
  },
  {
    id: "mullaitivu",
    name: "Mullaitivu",
    province: "Northern",
    path: "M 196.8,99.5 L 254.6,125 L 263.2,189.5 L 191,185 L 182.3,144.5 Z",
    labelX: 218,
    labelY: 150,
  },
  {
    id: "mannar",
    name: "Mannar",
    province: "Northern",
    path: "M 78.3,144.5 L 162.1,144.5 L 153.4,230 L 78.3,230 Z",
    labelX: 132,
    labelY: 185,
  },
  {
    id: "vavuniya",
    name: "Vavuniya",
    province: "Northern",
    path: "M 153.4,170 L 225.7,177.5 L 219.9,245 L 153.4,240.5 Z",
    labelX: 191,
    labelY: 210,
  },
  {
    id: "anuradhapura",
    name: "Anuradhapura",
    province: "North Central",
    path: "M 114.4,225.5 L 240.1,195.5 L 240.1,339.5 L 139,335 Z",
    labelX: 188,
    labelY: 280,
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    province: "North Central",
    path: "M 234.3,279.5 L 312.3,290 L 306.6,384.5 L 234.3,375.5 Z",
    labelX: 269,
    labelY: 335,
  },
  {
    id: "trincomalee",
    name: "Trincomalee",
    province: "Eastern",
    path: "M 240.1,185 L 326.8,185 L 335.4,305 L 240.1,290 Z",
    labelX: 282,
    labelY: 242,
  },
  {
    id: "batticaloa",
    name: "Batticaloa",
    province: "Eastern",
    path: "M 302.2,300.5 L 384.6,300.5 L 388.9,414.5 L 306.6,405.5 Z",
    labelX: 342,
    labelY: 360,
  },
  {
    id: "ampara",
    name: "Ampara",
    province: "Eastern",
    path: "M 273.3,399.5 L 399,399.5 L 388.9,552.5 L 321,545 L 283.4,455 Z",
    labelX: 346,
    labelY: 452,
  },
  {
    id: "puttalam",
    name: "Puttalam",
    province: "North Western",
    path: "M 75.4,230 L 139,275 L 124.6,441.5 L 75.4,441.5 Z",
    labelX: 108,
    labelY: 350,
  },
  {
    id: "kurunegala",
    name: "Kurunegala",
    province: "North Western",
    path: "M 124.6,324.5 L 196.8,335 L 196.8,440 L 118.8,440 Z",
    labelX: 162,
    labelY: 390,
  },
  {
    id: "matale",
    name: "Matale",
    province: "Central",
    path: "M 191,335 L 263.2,339.5 L 254.6,423.5 L 196.8,420.5 Z",
    labelX: 222,
    labelY: 384,
  },
  {
    id: "kandy",
    name: "Kandy",
    province: "Central",
    path: "M 186.7,414.5 L 263.2,417.5 L 244.4,474.5 L 186.7,477.5 Z",
    labelX: 220,
    labelY: 442,
  },
  {
    id: "nuwaraeliya",
    name: "Nuwara Eliya",
    province: "Central",
    path: "M 191,459.5 L 258.9,459.5 L 248.8,515 L 191,510.5 Z",
    labelX: 226,
    labelY: 488,
  },
  {
    id: "kegalle",
    name: "Kegalle",
    province: "Sabaragamuwa",
    path: "M 143.3,429.5 L 193.9,429.5 L 193.9,500 L 147.7,495.5 Z",
    labelX: 170,
    labelY: 462,
  },
  {
    id: "gampaha",
    name: "Gampaha",
    province: "Western",
    path: "M 89.9,435.5 L 153.4,435.5 L 143.3,489.5 L 89.9,488 Z",
    labelX: 122,
    labelY: 464,
  },
  {
    id: "colombo",
    name: "Colombo",
    province: "Western",
    path: "M 89.9,483.5 L 159.2,483.5 L 147.7,516.5 L 89.9,515 Z",
    labelX: 128,
    labelY: 499,
  },
  {
    id: "kalutara",
    name: "Kalutara",
    province: "Western",
    path: "M 95.7,513.5 L 167.9,513.5 L 167.9,570.5 L 104.3,570.5 Z",
    labelX: 136,
    labelY: 542,
  },
  {
    id: "ratnapura",
    name: "Ratnapura",
    province: "Sabaragamuwa",
    path: "M 157.8,495.5 L 254.6,504.5 L 254.6,585.5 L 162.1,575 Z",
    labelX: 205,
    labelY: 540,
  },
  {
    id: "badulla",
    name: "Badulla",
    province: "Uva",
    path: "M 248.8,414.5 L 302.2,414.5 L 292.1,525.5 L 244.4,519.5 Z",
    labelX: 274,
    labelY: 474,
  },
  {
    id: "monaragala",
    name: "Monaragala",
    province: "Uva",
    path: "M 287.8,450.5 L 355.7,459.5 L 345.6,585.5 L 254.6,579.5 L 277.7,519.5 Z",
    labelX: 318,
    labelY: 515,
  },
  {
    id: "galle",
    name: "Galle",
    province: "Southern",
    path: "M 110.1,564.5 L 186.7,564.5 L 176.6,635 L 114.4,630.5 Z",
    labelX: 152,
    labelY: 602,
  },
  {
    id: "matara",
    name: "Matara",
    province: "Southern",
    path: "M 176.6,567.5 L 225.7,567.5 L 219.9,645.5 L 173.7,639.5 Z",
    labelX: 200,
    labelY: 612,
  },
  {
    id: "hambantota",
    name: "Hambantota",
    province: "Southern",
    path: "M 219.9,573.5 L 364.3,545 L 345.6,635 L 215.6,635 Z",
    labelX: 278,
    labelY: 598,
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
  const [isPinching, setIsPinching] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<GridSubstation | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictShape | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs for multi-touch pinch-to-zoom, pan tracking, and double-tap detection
  const gestureRef = useRef<{
    initialDistance: number | null;
    initialZoom: number;
    initialPan: { x: number; y: number };
    pinchMidpoint: { x: number; y: number } | null;
    pointerDownPos: { x: number; y: number } | null;
    hasMovedBeyondThreshold: boolean;
    lastTapTime: number;
    lastTapPos: { x: number; y: number } | null;
  }>({
    initialDistance: null,
    initialZoom: 1,
    initialPan: { x: 0, y: 0 },
    pinchMidpoint: null,
    pointerDownPos: null,
    hasMovedBeyondThreshold: false,
    lastTapTime: 0,
    lastTapPos: null,
  });

  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 4.5;
  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  useEffect(() => {
    if (selectedStation) {
      const targetX = selectedStation.svgX;
      const targetY = selectedStation.svgY;
      const svgCenterX = 230;
      const svgCenterY = 350;
      setZoom(1.85);
      setPan({
        x: (svgCenterX - targetX) * 1.5,
        y: (svgCenterY - targetY) * 1.5,
      });
    }
  }, [selectedStation]);

  // Attach non-passive wheel listener for trackpad pinch & scroll wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - (rect.left + rect.width / 2);
      const cursorY = e.clientY - (rect.top + rect.height / 2);

      const zoomFactor = e.ctrlKey
        ? Math.exp(-e.deltaY * 0.01)
        : e.deltaY < 0
        ? 1.14
        : 0.88;

      setZoom((prevZoom) => {
        const nextZoom = clampZoom(prevZoom * zoomFactor);
        const ratio = nextZoom / prevZoom;
        setPan((prevPan) => ({
          x: cursorX - (cursorX - prevPan.x) * ratio,
          y: cursorY - (cursorY - prevPan.y) * ratio,
        }));
        return nextZoom;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleZoomIn = () => setZoom((prev) => clampZoom(prev + 0.45));
  const handleZoomOut = () => setZoom((prev) => clampZoom(prev - 0.45));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom towards a specific screen client coordinate (used for double-tap & double-click)
  const zoomAtClientPoint = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const focalX = clientX - (rect.left + rect.width / 2);
    const focalY = clientY - (rect.top + rect.height / 2);

    if (zoom >= 2.4) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      const nextZoom = clampZoom(zoom * 1.65);
      const ratio = nextZoom / zoom;
      setZoom(nextZoom);
      setPan({
        x: focalX - (focalX - pan.x) * ratio,
        y: focalY - (focalY - pan.y) * ratio,
      });
    }
  };

  // Mouse pan & double-click handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    gestureRef.current.pointerDownPos = { x: e.clientX, y: e.clientY };
    gestureRef.current.hasMovedBeyondThreshold = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if (gestureRef.current.pointerDownPos) {
      const dist = Math.hypot(
        e.clientX - gestureRef.current.pointerDownPos.x,
        e.clientY - gestureRef.current.pointerDownPos.y
      );
      if (dist > 5) {
        gestureRef.current.hasMovedBeyondThreshold = true;
      }
    }
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    zoomAtClientPoint(e.clientX, e.clientY);
  };

  // Helper to get distance and midpoint between two touch points
  const getTouchMetrics = (t1: React.Touch, t2: React.Touch) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return {
      distance: Math.hypot(dx, dy),
      midpoint: {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      },
    };
  };

  // Multi-touch hand gesture handlers (1-finger pan, 2-finger pinch-to-zoom + pan, double-tap zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Start 2-finger pinch-to-zoom & pan gesture
      const { distance, midpoint } = getTouchMetrics(e.touches[0], e.touches[1]);
      setIsDragging(false);
      setIsPinching(true);
      gestureRef.current.initialDistance = distance;
      gestureRef.current.initialZoom = zoom;
      gestureRef.current.initialPan = { ...pan };
      gestureRef.current.pinchMidpoint = midpoint;
      gestureRef.current.hasMovedBeyondThreshold = true;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPinching(false);
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      gestureRef.current.pointerDownPos = { x: touch.clientX, y: touch.clientY };
      gestureRef.current.hasMovedBeyondThreshold = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && gestureRef.current.initialDistance && gestureRef.current.pinchMidpoint) {
      const { distance, midpoint } = getTouchMetrics(e.touches[0], e.touches[1]);
      const scale = distance / gestureRef.current.initialDistance;
      const nextZoom = clampZoom(gestureRef.current.initialZoom * scale);

      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Focal point relative to container center at start of pinch
        const startFocalX = gestureRef.current.pinchMidpoint.x - centerX;
        const startFocalY = gestureRef.current.pinchMidpoint.y - centerY;

        // Current midpoint translation
        const deltaMidX = midpoint.x - gestureRef.current.pinchMidpoint.x;
        const deltaMidY = midpoint.y - gestureRef.current.pinchMidpoint.y;

        const zoomRatio = nextZoom / gestureRef.current.initialZoom;

        setZoom(nextZoom);
        setPan({
          x:
            startFocalX -
            (startFocalX - gestureRef.current.initialPan.x) * zoomRatio +
            deltaMidX,
          y:
            startFocalY -
            (startFocalY - gestureRef.current.initialPan.y) * zoomRatio +
            deltaMidY,
        });
      } else {
        setZoom(nextZoom);
      }
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      if (gestureRef.current.pointerDownPos) {
        const dist = Math.hypot(
          touch.clientX - gestureRef.current.pointerDownPos.x,
          touch.clientY - gestureRef.current.pointerDownPos.y
        );
        if (dist > 6) {
          gestureRef.current.hasMovedBeyondThreshold = true;
        }
      }
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPinching) {
      // Transition smoothly from 2-finger pinch back to 1-finger pan without jumping
      const remainingTouch = e.touches[0];
      setIsPinching(false);
      setIsDragging(true);
      setDragStart({
        x: remainingTouch.clientX - pan.x,
        y: remainingTouch.clientY - pan.y,
      });
      gestureRef.current.initialDistance = null;
      return;
    }

    if (e.touches.length === 0) {
      // Check for double-tap on empty map canvas
      if (
        !isPinching &&
        !gestureRef.current.hasMovedBeyondThreshold &&
        e.changedTouches.length === 1
      ) {
        const touch = e.changedTouches[0];
        const now = Date.now();
        const prevTime = gestureRef.current.lastTapTime;
        const prevPos = gestureRef.current.lastTapPos;

        if (
          now - prevTime < 300 &&
          prevPos &&
          Math.hypot(touch.clientX - prevPos.x, touch.clientY - prevPos.y) < 32
        ) {
          zoomAtClientPoint(touch.clientX, touch.clientY);
          gestureRef.current.lastTapTime = 0;
          gestureRef.current.lastTapPos = null;
        } else {
          gestureRef.current.lastTapTime = now;
          gestureRef.current.lastTapPos = { x: touch.clientX, y: touch.clientY };
        }
      }

      setIsDragging(false);
      setIsPinching(false);
      gestureRef.current.initialDistance = null;
      gestureRef.current.pinchMidpoint = null;
    }
  };

  // Memoize station visuals & district states so pan/zoom dragging runs at 60fps without recalculating
  const stationVisualsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        fill: string;
        stroke: string;
        thirdGroupHex: string | undefined;
        halo: string;
        isPulsing: boolean;
        label: string;
        dimmed: boolean;
      }
    >();

    for (const station of substations) {
      const status = getSubstationStatus(station, selectedDate, currentHourFloat);
      const stationGroups = station.groupFeeders.map((g) => g.group);
      const matchesFilter =
        selectedGroupFilter === 'all' ||
        station.groupFeeders.some((g) => g.group === selectedGroupFilter);

      if (selectedGroupFilter !== 'all') {
        const targetColor = GROUP_COLORS[selectedGroupFilter];
        const secondaryGrp = stationGroups.find((g) => g !== selectedGroupFilter);
        map.set(station.id, {
          fill: matchesFilter ? targetColor.hex : '#334155',
          stroke: matchesFilter
            ? secondaryGrp
              ? GROUP_COLORS[secondaryGrp].hex
              : '#FFFFFF'
            : '#475569',
          thirdGroupHex: undefined,
          halo: matchesFilter ? targetColor.bgRgba : 'transparent',
          isPulsing: matchesFilter && status.state === 'cut_active',
          label: matchesFilter
            ? `${targetColor.name} (${status.state === 'cut_active' ? 'Cut Active' : 'Scheduled'})`
            : `Not in ${targetColor.name}`,
          dimmed: !matchesFilter,
        });
        continue;
      }

      if (colorMode === 'status') {
        if (status.state === 'cut_active') {
          map.set(station.id, {
            fill: '#F43F5E',
            stroke: '#FFE4E6',
            thirdGroupHex: undefined,
            halo: 'rgba(244, 63, 94, 0.45)',
            isPulsing: true,
            label: `Power Cut Active (Group 0${status.activeGroup})`,
            dimmed: false,
          });
          continue;
        }
        if (status.state === 'cut_approaching') {
          map.set(station.id, {
            fill: '#F59E0B',
            stroke: '#FEF3C7',
            thirdGroupHex: undefined,
            halo: 'rgba(245, 158, 11, 0.35)',
            isPulsing: true,
            label: 'Cut in < 45m',
            dimmed: false,
          });
          continue;
        }
        map.set(station.id, {
          fill: '#10B981',
          stroke: '#D1FAE5',
          thirdGroupHex: undefined,
          halo: 'rgba(16, 185, 129, 0.15)',
          isPulsing: false,
          label: 'Power Active',
          dimmed: false,
        });
        continue;
      }

      const firstGroup = stationGroups[0] || 1;
      const secondGroup = stationGroups[1];
      const thirdGroup = stationGroups[2];
      const firstColor = GROUP_COLORS[firstGroup];
      const secondColor = secondGroup ? GROUP_COLORS[secondGroup] : null;
      const thirdColor = thirdGroup ? GROUP_COLORS[thirdGroup] : null;

      map.set(station.id, {
        fill: firstColor.hex,
        stroke: secondColor ? secondColor.hex : '#FFFFFF',
        thirdGroupHex: thirdColor?.hex,
        halo: firstColor.bgRgba,
        isPulsing: status.state === 'cut_active',
        label: `Groups ${stationGroups.map((g) => `0${g}`).join(', ')}`,
        dimmed: false,
      });
    }

    return map;
  }, [substations, selectedDate, currentHourFloat, colorMode, selectedGroupFilter]);

  const districtStateMap = useMemo(() => {
    const map = new Map<string, { hasGroupStation: boolean; hasActiveCut: boolean }>();
    for (const district of SRI_LANKA_DISTRICTS) {
      const districtStations = substations.filter(
        (s) => s.district.toLowerCase() === district.name.toLowerCase()
      );
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
      map.set(district.id, { hasGroupStation, hasActiveCut });
    }
    return map;
  }, [substations, selectedDate, currentHourFloat, colorMode, selectedGroupFilter]);

  const activeCutCount = useMemo(
    () =>
      substations.filter(
        (s) => getSubstationStatus(s, selectedDate, currentHourFloat).state === 'cut_active'
      ).length,
    [substations, selectedDate, currentHourFloat]
  );

  const matchingGroupStationCount = useMemo(
    () =>
      selectedGroupFilter === 'all'
        ? substations.length
        : substations.filter((s) =>
            s.groupFeeders.some((g) => g.group === selectedGroupFilter)
          ).length,
    [substations, selectedGroupFilter]
  );

  return (
    <div
      role="region"
      aria-label="Interactive Sri Lanka Grid Substation Map"
      className="relative w-full h-full min-h-[480px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col bg-[#080C14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl"
    >
      {/* Top Map Toolbar (Responsive for Mobile & Desktop) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-20 flex flex-col gap-1.5 sm:gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
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
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                colorMode === 'status' && selectedGroupFilter === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
              <span>Cut Status</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeColorMode('group')}
              aria-pressed={colorMode === 'group'}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                colorMode === 'group'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
              <span>Groups (1–4)</span>
            </button>
          </div>

          {/* Live Cut / Group Match Indicator Status */}
          <div
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg text-[11px] sm:text-xs"
          >
            {selectedGroupFilter !== 'all' ? (
              <>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: GROUP_COLORS[selectedGroupFilter].hex }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-white font-mono tabular-nums">
                  {matchingGroupStationCount}
                </span>
                <span className="text-slate-300">
                  <span className="hidden sm:inline">Substations in </span>
                  {GROUP_COLORS[selectedGroupFilter].name}
                </span>
              </>
            ) : activeCutCount > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" aria-hidden="true" />
                <span className="font-semibold text-rose-400 font-mono tabular-nums">
                  {activeCutCount}
                </span>
                <span className="text-slate-300">
                  <span className="hidden sm:inline">Substations </span>Affected
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                <span className="text-emerald-400 font-medium">All Powered</span>
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
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selectedGroupFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-600/70'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({substations.length})
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
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

      {/* Floating Zoom & Pan Controls (Touch-friendly >= 40px buttons + Zoom readout) */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex flex-col items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom In Map"
          title="Zoom In"
          className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <div
          aria-label={`Current zoom ${zoom.toFixed(1)}x`}
          className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums py-0.5 select-none"
        >
          {zoom.toFixed(1)}x
        </div>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom Out Map"
          title="Zoom Out"
          className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset Map View"
          title="Reset Map View"
          className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Map Legend (Responsive & Compact on Mobile) */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-[10px] sm:text-[11px] shadow-xl max-w-[195px] sm:max-w-[250px]">
        <div className="text-slate-400 font-semibold mb-1 sm:mb-1.5 uppercase tracking-wider text-[9px] sm:text-[10px]">
          {colorMode === 'status' && selectedGroupFilter === 'all'
            ? 'Live Cut Legend'
            : 'CEB Group Legend'}
        </div>
        {colorMode === 'status' && selectedGroupFilter === 'all' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] shrink-0" aria-hidden="true" />
              <span className="text-slate-200">Power Cut Active</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] shrink-0" aria-hidden="true" />
              <span className="text-slate-200">Cut Impending (&lt; 45m)</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-slate-300">Supply Normal</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
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
                    <span className="font-medium">G0{grp}</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:block text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Dual-ring pins indicate stations across multiple groups.
            </div>
          </div>
        )}
        <div className="text-[9px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800/80">
          Pinch or double-tap map to zoom
        </div>
      </div>

      {/* Main SVG Map Canvas with Multi-Touch Pinch-to-Zoom, Double-Tap, & Pan */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg
          ref={svgRef}
          viewBox="0 -20 460 725"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Map of Sri Lanka showing the island coastline, 25 administrative districts, and 69 CEB Grid Substations"
          className={`w-full h-full max-h-[700px] ${
            isDragging || isPinching ? '' : 'transition-transform duration-200 ease-out'
          }`}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <defs>
            <pattern id="gridPattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148, 163, 184, 0.045)" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="58%">
              <stop offset="0%" stopColor="#0E1B33" />
              <stop offset="100%" stopColor="#05080F" />
            </radialGradient>
            <linearGradient id="landFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#172A4A" />
              <stop offset="100%" stopColor="#101D35" />
            </linearGradient>
            <filter id="glowRose" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="coastGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="5" result="coastBlur" />
            </filter>
            {/* Exact Sri Lanka Island Coastline Clip Path */}
            <clipPath id="sriLankaCoastClip">
              <path d={SRI_LANKA_MAIN_COASTLINE_PATH} />
              <path d={MANNAR_ISLAND_PATH} />
              <path d={KAYTS_ISLAND_PATH} />
            </clipPath>
          </defs>

          {/* Deep Indian Ocean Background */}
          <rect x="0" y="-20" width="460" height="725" fill="url(#oceanGlow)" />
          <rect x="0" y="-20" width="460" height="725" fill="url(#gridPattern)" />

          {/* Cartographic Latitude / Longitude Graticule & Ocean Labels */}
          <g className="pointer-events-none select-none" opacity="0.45">
            <line x1="0" y1="150" x2="460" y2="150" stroke="#1E293B" strokeWidth="0.7" strokeDasharray="4,4" />
            <text x="10" y="146" fill="#475569" fontSize="6.5" fontFamily="monospace">9°00&apos;N</text>
            <line x1="0" y1="315" x2="460" y2="315" stroke="#1E293B" strokeWidth="0.7" strokeDasharray="4,4" />
            <text x="10" y="311" fill="#475569" fontSize="6.5" fontFamily="monospace">8°00&apos;N</text>
            <line x1="0" y1="480" x2="460" y2="480" stroke="#1E293B" strokeWidth="0.7" strokeDasharray="4,4" />
            <text x="10" y="476" fill="#475569" fontSize="6.5" fontFamily="monospace">7°00&apos;N</text>
            <line x1="0" y1="640" x2="460" y2="640" stroke="#1E293B" strokeWidth="0.7" strokeDasharray="4,4" />
            <text x="10" y="636" fill="#475569" fontSize="6.5" fontFamily="monospace">6°00&apos;N</text>

            <text x="48" y="255" fill="#334155" fontSize="7" fontWeight="600" letterSpacing="2" textAnchor="middle">
              GULF OF MANNAR
            </text>
            <text x="392" y="210" fill="#334155" fontSize="7" fontWeight="600" letterSpacing="2" textAnchor="middle">
              BAY OF BENGAL
            </text>
            <text x="95" y="668" fill="#334155" fontSize="7.5" fontWeight="600" letterSpacing="2.5" textAnchor="middle">
              INDIAN OCEAN
            </text>
          </g>

          {/* Sri Lanka Landmass & Coastline Layer */}
          <g className="island-landmass">
            {/* 1. Outer Coastal Shelf Bathymetric Glow */}
            <path
              d={SRI_LANKA_MAIN_COASTLINE_PATH}
              fill="none"
              stroke="#0284C7"
              strokeWidth="12"
              strokeOpacity="0.22"
              strokeLinejoin="round"
              filter="url(#coastGlow)"
            />
            <path
              d={SRI_LANKA_MAIN_COASTLINE_PATH}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="5"
              strokeOpacity="0.28"
              strokeLinejoin="round"
            />
            <path
              d={MANNAR_ISLAND_PATH}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="5"
              strokeOpacity="0.25"
              strokeLinejoin="round"
            />

            {/* 2. Solid Sri Lanka Island Silhouette Base */}
            <path
              d={SRI_LANKA_MAIN_COASTLINE_PATH}
              fill="url(#landFillGrad)"
              stroke="none"
            />
            <path
              d={MANNAR_ISLAND_PATH}
              fill="url(#landFillGrad)"
              stroke="none"
            />
            <path
              d={KAYTS_ISLAND_PATH}
              fill="url(#landFillGrad)"
              stroke="none"
            />

            {/* 3. 25 Administrative Districts Clipped to Exact Sri Lanka Coastline */}
            <g clipPath="url(#sriLankaCoastClip)">
              {SRI_LANKA_DISTRICTS.map((district) => {
                const isHovered = hoveredDistrict?.id === district.id;
                const dState = districtStateMap.get(district.id);
                const hasGroupStation = dState?.hasGroupStation ?? false;
                const hasActiveCut = dState?.hasActiveCut ?? false;

                let fillStyle = isHovered ? '#1E3252' : 'rgba(22, 37, 66, 0.85)';
                let strokeStyle = isHovered ? '#60A5FA' : '#2C4468';

                if (hasGroupStation && typeof selectedGroupFilter === 'number') {
                  fillStyle = GROUP_COLORS[selectedGroupFilter].bgRgba;
                  strokeStyle = GROUP_COLORS[selectedGroupFilter].hex;
                } else if (hasActiveCut) {
                  fillStyle = 'rgba(244, 63, 94, 0.16)';
                  strokeStyle = 'rgba(244, 63, 94, 0.5)';
                }

                return (
                  <path
                    key={district.id}
                    d={district.path}
                    fill={fillStyle}
                    stroke={strokeStyle}
                    strokeWidth={isHovered || hasGroupStation ? '1.6' : '1.1'}
                    strokeDasharray={isHovered || hasGroupStation ? undefined : '3,2'}
                    className="transition-colors duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredDistrict(district)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  />
                );
              })}
            </g>

            {/* 4. Crisp, High-Contrast Double Coastline Outline of Sri Lanka */}
            <path
              d={SRI_LANKA_MAIN_COASTLINE_PATH}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.4"
              strokeOpacity="0.92"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="pointer-events-none"
            />
            <path
              d={SRI_LANKA_MAIN_COASTLINE_PATH}
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="0.85"
              strokeOpacity="0.65"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="pointer-events-none"
            />
            <path
              d={MANNAR_ISLAND_PATH}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.8"
              strokeOpacity="0.9"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
            <path
              d={KAYTS_ISLAND_PATH}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.9"
              strokeLinejoin="round"
              className="pointer-events-none"
            />

            {/* 5. District Labels */}
            {SRI_LANKA_DISTRICTS.map((d) => (
              <text
                key={`label-${d.id}`}
                x={d.labelX}
                y={d.labelY}
                fill="rgba(186, 230, 253, 0.46)"
                fontSize="7.5"
                fontWeight="600"
                textAnchor="middle"
                className="pointer-events-none select-none tracking-wider"
              >
                {d.name.toUpperCase()}
              </text>
            ))}
          </g>

          {/* National 220kV / 132kV Transmission Grid Backbone Hints */}
          <g stroke="rgba(56, 189, 248, 0.16)" strokeWidth="0.9" strokeDasharray="3,3" fill="none" className="pointer-events-none">
            <line x1="105" y1="488" x2="207" y2="436" />
            <line x1="207" y1="436" x2="180" y2="277" />
            <line x1="105" y1="488" x2="153" y2="619" />
            <line x1="180" y1="277" x2="179" y2="119" />
            <line x1="179" y1="119" x2="126" y2="66" />
            <line x1="207" y1="436" x2="266" y2="336" />
            <line x1="266" y1="336" x2="299" y2="241" />
            <line x1="207" y1="436" x2="274" y2="478" />
          </g>

          {/* Grid Substation Pins (Keyboard, Mouse & Mobile Touch Accessible) */}
          <g className="substation-pins">
            {substations.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              const isHighlighted = highlightedStationId === station.id;
              const isHovered = hoveredStation?.id === station.id;
              const visuals = stationVisualsMap.get(station.id)!;

              return (
                <g
                  key={station.id}
                  transform={`translate(${station.svgX}, ${station.svgY})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${station.displayName} Grid Substation, ${station.district} District, ${visuals.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (gestureRef.current.hasMovedBeyondThreshold) return;
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
                  {/* Expanded Touch Hit Target for Mobile Fingers */}
                  <circle r="13" fill="transparent" />

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
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs max-w-[94%]"
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

/**
 * TimelineScrubber Component
 * Real-time Sri Lanka Standard Time (SLST) tracker and interactive time slider
 * to preview power cuts across Sri Lanka at any hour.
 */

import React, { useState, useEffect } from 'react';
import {
  DAY_SCHEDULES,
  GROUP_COLORS,
  formatHourFloat,
} from '../data/powerCutData';
import { Clock, Zap } from 'lucide-react';

interface TimelineScrubberProps {
  selectedDate: string;
  currentHourFloat: number;
  onChangeHourFloat: (hour: number) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  selectedDate,
  currentHourFloat,
  onChangeHourFloat,
  isLiveMode,
  onToggleLiveMode,
}) => {
  const [slstString, setSlstString] = useState<string>('');
  const schedule = DAY_SCHEDULES[selectedDate] || DAY_SCHEDULES['2026-10-19'];

  // Live ticking Sri Lanka Standard Time (UTC+5:30) display
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setSlstString(formatter.format(now));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Identify active slot at this hour
  const activeSlot = schedule.slots.find(
    (s) => currentHourFloat >= s.startHour && currentHourFloat < s.endHour
  );

  // Clamp slider display value within [16, 21] for smooth scrubbing of the peak evening window
  const sliderValue = Math.min(21, Math.max(16, currentHourFloat));

  return (
    <section
      aria-label="Real-Time Power Cut Timeline and Status"
      className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md"
    >
      {/* Top Status and Time Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Map Simulation / Live Time */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs font-mono font-bold text-white shadow-inner">
            <Clock className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            <span className="tabular-nums">{formatHourFloat(currentHourFloat)}</span>
            <span className="text-[10px] font-sans font-normal text-slate-400">
              {isLiveMode ? '(SLST Live)' : '(Preview)'}
            </span>
          </div>

          {/* Active Outage Group Status */}
          <div aria-live="polite">
            {activeSlot ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Power cut in effect:</span>
                <span
                  className="font-bold font-mono text-xs"
                  style={{ color: GROUP_COLORS[activeSlot.group].hex }}
                >
                  Group 0{activeSlot.group} ({activeSlot.label})
                </span>
              </div>
            ) : (
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                <span>Outside Demand Management Window (04:30 PM – 08:30 PM) · Power On</span>
              </div>
            )}
          </div>
        </div>

        {/* Live SLST Clock & Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-2.5">
          {slstString && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
              <span>Colombo Time:</span>
              <span className="text-slate-200 font-semibold">{slstString}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleLiveMode}
            aria-pressed={isLiveMode}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              isLiveMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
              aria-hidden="true"
            />
            <span>{isLiveMode ? 'Syncing Real-Time SLST' : 'Switch to Live SLST Clock'}</span>
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
          <label htmlFor="peak-time-slider" className="font-sans text-slate-400">
            Scrub Evening Peak (04:00 PM – 09:00 PM):
          </label>
          <span className="tabular-nums font-semibold text-slate-200">{formatHourFloat(sliderValue)}</span>
        </div>
        <input
          id="peak-time-slider"
          type="range"
          min="16"
          max="21"
          step="0.05"
          aria-label="Preview power cut schedule between 4:00 PM and 9:00 PM"
          value={sliderValue}
          onChange={(e) => {
            if (isLiveMode) onToggleLiveMode();
            onChangeHourFloat(parseFloat(e.target.value));
          }}
          className="w-full h-2.5 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 touch-pan-y focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />

        {/* Quick Slot Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {schedule.slots.map((slot) => {
            const isSlotActive =
              currentHourFloat >= slot.startHour && currentHourFloat < slot.endHour;
            const grpColor = GROUP_COLORS[slot.group];

            return (
              <button
                key={slot.slotIndex}
                type="button"
                aria-pressed={isSlotActive}
                onClick={() => {
                  if (isLiveMode) onToggleLiveMode();
                  onChangeHourFloat(slot.startHour + 0.25);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isSlotActive
                    ? 'bg-slate-800/90 border-rose-500/70 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-slate-300 tabular-nums">
                  <span>{slot.label.replace(' - ', '–')}</span>
                  {isSlotActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 font-semibold" style={{ color: grpColor.hex }}>
                  <Zap className="w-3 h-3" aria-hidden="true" />
                  <span>Group 0{slot.group}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

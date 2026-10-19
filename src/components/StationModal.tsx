/**
 * StationModal Component
 * Detailed accessible dialog for the selected Grid Substation,
 * including 3-day outage timetable, feeder-specific check, and live countdown.
 */

import React, { useState, useEffect } from 'react';
import {
  GridSubstation,
  DAY_SCHEDULES,
  GROUP_COLORS,
  getSubstationStatus,
} from '../data/powerCutData';
import {
  X,
  Zap,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Info,
} from 'lucide-react';

interface StationModalProps {
  station: GridSubstation;
  onClose: () => void;
  selectedDate: string;
  currentHourFloat: number;
}

export const StationModal: React.FC<StationModalProps> = ({
  station,
  onClose,
  selectedDate,
  currentHourFloat,
}) => {
  const [selectedFeeder, setSelectedFeeder] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key for WCAG keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const status = getSubstationStatus(station, selectedDate, currentHourFloat);
  const activeDaySchedule = DAY_SCHEDULES[selectedDate] || DAY_SCHEDULES['2026-10-19'];

  const handleShare = () => {
    const text = `CEB Power Cut Schedule for ${station.displayName} (${station.district} District):\nDate: ${activeDaySchedule.displayDate}\nGroups: ${station.groupFeeders.map((g) => `Group ${g.group}`).join(', ')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-rose-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="station-modal-title" className="text-xl font-bold text-white tracking-tight">
                  {station.displayName}
                </h2>
                {station.sinhalaName && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({station.sinhalaName})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{station.district} District</span>
                <span aria-hidden="true">·</span>
                <span>{station.province} Province</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Copy Schedule Summary"
              title="Copy Summary"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {copied ? (
                <span className="text-xs text-emerald-400 font-semibold px-1">Copied!</span>
              ) : (
                <Share2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Station Details"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Real-time Status Card */}
          <div
            aria-live="polite"
            className={`p-4 rounded-2xl border transition-all ${
              status.state === 'cut_active'
                ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30'
                : status.state === 'cut_approaching'
                ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30'
                : 'bg-emerald-950/30 border-emerald-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {status.state === 'cut_active' ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0" aria-hidden="true" />
                ) : status.state === 'cut_approaching' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                )}
                <div>
                  <div className="text-sm font-bold text-white">
                    {status.state === 'cut_active'
                      ? 'Power Interruption Active Right Now'
                      : status.state === 'cut_approaching'
                      ? 'Power Cut Imminent (< 45 min)'
                      : 'Power Supply Currently Normal'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {status.state === 'cut_active' && status.activeSlot ? (
                      <span>
                        Group 0{status.activeGroup} interrupted ({status.activeSlot.label}).{' '}
                        <strong className="text-rose-300 font-mono tabular-nums">
                          ~{status.minutesRemaining} mins
                        </strong>{' '}
                        until restoration.
                      </span>
                    ) : status.state === 'cut_approaching' && status.nextCutSlot ? (
                      <span>
                        Starts at {status.nextCutSlot.label} (~{status.minutesUntilCut} mins remaining).
                      </span>
                    ) : status.nextCutSlot ? (
                      <span>
                        Next scheduled cut today: {status.nextCutSlot.label} (Group 0{status.nextCutGroup}).
                      </span>
                    ) : (
                      <span>No further scheduled power cuts for this substation today.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feeder Allocation Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Feeders &amp; Group Allocations
              </h3>
              <span className="text-[11px] text-slate-400">Select feeder to highlight</span>
            </div>

            <div className="space-y-2.5">
              {station.groupFeeders.map((gf) => {
                const groupStyle = GROUP_COLORS[gf.group];
                return (
                  <div
                    key={gf.group}
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: groupStyle.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-bold text-white">{groupStyle.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {gf.feeders.length} {gf.feeders.length === 1 ? 'Feeder' : 'Feeders'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {gf.feeders.map((fdr) => {
                        const isSelected = selectedFeeder === fdr;
                        return (
                          <button
                            key={fdr}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setSelectedFeeder(isSelected ? null : fdr)
                            }
                            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                                : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                            }`}
                          >
                            Feeder {fdr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-Day Schedule Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>3-Day Demand Management Timetable</span>
            </h3>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
              {Object.keys(DAY_SCHEDULES).map((dateKey) => {
                const day = DAY_SCHEDULES[dateKey];
                const isToday = selectedDate === dateKey;
                const stationGroups = new Set(station.groupFeeders.map((g) => g.group));
                const applicableSlots = day.slots.filter((s) => stationGroups.has(s.group));

                return (
                  <div
                    key={dateKey}
                    className={`p-3.5 ${
                      isToday ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{day.displayDate}</span>
                        {isToday && (
                          <span className="text-[11px] text-rose-400 font-medium">
                            · Active Date
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">1 hr duration</span>
                    </div>

                    <div className="space-y-1">
                      {applicableSlots.map((slot) => {
                        const grpColor = GROUP_COLORS[slot.group];
                        return (
                          <div
                            key={slot.slotIndex}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: grpColor.hex }}
                                aria-hidden="true"
                              />
                              <span className="font-medium text-slate-200">
                                {grpColor.name}
                              </span>
                            </div>
                            <div className="font-mono text-slate-300 tabular-nums">
                              {slot.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suburbs & Towns Covered */}
          {station.townAliases.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Surrounding Towns &amp; Areas Served
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                {station.townAliases.map((town, idx) => (
                  <React.Fragment key={town}>
                    <span>{town}</span>
                    {idx < station.townAliases.length - 1 && (
                      <span className="text-slate-600" aria-hidden="true">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Notice & Disclaimer Footer */}
          <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Interruption times may vary by +/- 30 minutes depending on generation capacity and national grid weather conditions.
            </p>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

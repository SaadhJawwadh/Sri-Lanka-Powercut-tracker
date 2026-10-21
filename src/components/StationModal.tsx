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
  const [selectedFeeder, setSelectedFeeder] = useState<{
    feeder: string;
    group: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset selected feeder when station changes
  useEffect(() => {
    setSelectedFeeder(null);
  }, [station.id]);

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
    const scheduleLines = Object.values(DAY_SCHEDULES)
      .map((day) => {
        const stationGroups = new Set(station.groupFeeders.map((g) => g.group));
        const slots = day.slots
          .filter((s) => stationGroups.has(s.group))
          .map(
            (s) =>
              `Group 0${s.group}: Disconnect ${s.disconnectTime} -> Restore ${s.restorationTime} (${s.duration})`
          )
          .join('; ');
        return `${day.displayDate}: ${slots}`;
      })
      .join('\n');

    const text = `CEB Power Cut Schedule — ${station.displayName} (${station.district} District)\nFeeders: ${station.groupFeeders
      .map((g) => `Group 0${g.group} [${g.feeders.join(', ')}]`)
      .join(' | ')}\n${scheduleLines}`;

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] sm:max-h-[92vh] flex flex-col bg-[#0F172A] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Bottom-Sheet Handle Bar */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" aria-hidden="true" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-rose-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="station-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {station.displayName}
                </h2>
                {station.sinhalaName && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({station.sinhalaName})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span>{station.district} District</span>
                <span aria-hidden="true">·</span>
                <span>{station.province} Province</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 font-medium">
                  {station.groupFeeders.map((g) => `Group 0${g.group}`).join(' & ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Copy Schedule Summary"
              title="Copy Summary"
              className="min-w-[40px] h-10 px-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
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
              <div className="flex items-start gap-3">
                {status.state === 'cut_active' ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0 mt-1" aria-hidden="true" />
                ) : status.state === 'cut_approaching' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <div className="text-sm font-bold text-white">
                    {status.state === 'cut_active'
                      ? `Power Interruption Active (${activeDaySchedule.displayDate})`
                      : status.state === 'cut_approaching'
                      ? 'Power Cut Imminent (< 45 min)'
                      : `Power Supply Normal at Selected Time (${activeDaySchedule.displayDate})`}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 space-y-1">
                    {status.state === 'cut_active' && status.activeSlot ? (
                      <>
                        <p>
                          <strong className="text-white">Group 0{status.activeGroup}</strong> feeders (
                          <span className="font-mono text-rose-200">
                            {station.groupFeeders
                              .find((g) => g.group === status.activeGroup)
                              ?.feeders.join(', ')}
                          </span>
                          ) are currently interrupted.{' '}
                          <strong className="text-rose-300 font-mono tabular-nums">
                            ~{status.minutesRemaining} mins
                          </strong>{' '}
                          remaining.
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Disconnection: {status.activeSlot.disconnectTime} · Restoration: {status.activeSlot.restorationTime}
                        </p>
                      </>
                    ) : status.state === 'cut_approaching' && status.nextCutSlot ? (
                      <p>
                        Group 0{status.nextCutGroup} cut begins in{' '}
                        <strong className="text-amber-300 font-mono">~{status.minutesUntilCut} mins</strong> (
                        {status.nextCutSlot.disconnectTime} → {status.nextCutSlot.restorationTime}).
                      </p>
                    ) : status.nextCutSlot ? (
                      <p>
                        Next scheduled interruption on {activeDaySchedule.displayDate}:{' '}
                        <strong className="text-white">Group 0{status.nextCutGroup}</strong> — Disconnect{' '}
                        <span className="font-mono text-slate-200">{status.nextCutSlot.disconnectTime}</span>, Restore{' '}
                        <span className="font-mono text-slate-200">{status.nextCutSlot.restorationTime}</span> (1 hour).
                      </p>
                    ) : (
                      <p>
                        All scheduled evening demand management slots (04:30 PM – 08:30 PM) have concluded for{' '}
                        {activeDaySchedule.displayDate}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Feeder Allocation Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. CEB Feeder Numbers &amp; Group Assignment
              </h3>
              <span className="text-[11px] text-slate-400">
                Tap a feeder number to filter its exact timetable
              </span>
            </div>

            <div className="space-y-2.5">
              {station.groupFeeders.map((gf) => {
                const groupStyle = GROUP_COLORS[gf.group];
                const todaySlot = activeDaySchedule.slots.find((s) => s.group === gf.group);

                return (
                  <div
                    key={gf.group}
                    className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: groupStyle.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-bold text-white">{groupStyle.name}</span>
                        <span className="text-[11px] text-slate-400">
                          · {gf.feeders.length} {gf.feeders.length === 1 ? 'Feeder' : 'Feeders'}
                        </span>
                      </div>
                      {todaySlot && (
                        <span className="text-[11px] font-mono text-slate-300">
                          {activeDaySchedule.displayDate.replace(' 2026', '')}:{' '}
                          <strong style={{ color: groupStyle.hex }}>{todaySlot.label}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {gf.feeders.map((fdr) => {
                        const isSelected =
                          selectedFeeder?.feeder === fdr && selectedFeeder?.group === gf.group;
                        return (
                          <button
                            key={`${gf.group}-${fdr}`}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setSelectedFeeder(
                                isSelected ? null : { feeder: fdr, group: gf.group }
                              )
                            }
                            className={`px-3 py-1.5 min-h-[34px] text-xs font-mono font-medium rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
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

            {/* Selected Feeder Instant Summary Callout */}
            {selectedFeeder && (
              <div className="mt-3 p-3.5 bg-slate-900 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-white font-mono">
                    Feeder {selectedFeeder.feeder}
                  </span>{' '}
                  at {station.displayName} is assigned to{' '}
                  <strong style={{ color: GROUP_COLORS[selectedFeeder.group].hex }}>
                    Group 0{selectedFeeder.group}
                  </strong>
                  . Showing only Group 0{selectedFeeder.group} times below.
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeeder(null)}
                  className="text-[11px] font-semibold text-rose-300 hover:text-white underline shrink-0 text-left sm:text-right"
                >
                  Show all groups
                </button>
              </div>
            )}
          </div>

          {/* Step 2: 3-Day Schedule Table with Official Disconnection & Restoration Windows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>2. Official 3-Day Demand Management Timetable (19–21 Oct 2026)</span>
              </h3>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
              {Object.keys(DAY_SCHEDULES).map((dateKey) => {
                const day = DAY_SCHEDULES[dateKey];
                const isSelectedDay = selectedDate === dateKey;
                const stationGroups = new Set(
                  selectedFeeder
                    ? [selectedFeeder.group]
                    : station.groupFeeders.map((g) => g.group)
                );
                const applicableSlots = day.slots.filter((s) => stationGroups.has(s.group));

                return (
                  <div
                    key={dateKey}
                    className={`p-3.5 sm:p-4 ${
                      isSelectedDay ? 'bg-slate-800/45' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>{day.displayDate}</span>
                        <span className="text-slate-400 font-normal">({day.sinhalaDate})</span>
                        {isSelectedDay && (
                          <span className="text-[11px] text-rose-400 font-semibold">
                            · Viewing Date
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        Duration: 1 hour
                      </span>
                    </div>

                    <div className="space-y-2">
                      {applicableSlots.map((slot) => {
                        const grpColor = GROUP_COLORS[slot.group];
                        const grpFeeders =
                          station.groupFeeders.find((g) => g.group === slot.group)?.feeders || [];

                        return (
                          <div
                            key={slot.slotIndex}
                            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs flex flex-col gap-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: grpColor.hex }}
                                  aria-hidden="true"
                                />
                                <span
                                  className="font-bold text-xs"
                                  style={{ color: grpColor.hex }}
                                >
                                  {grpColor.name}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  · Feeders:{' '}
                                  <strong className="font-mono text-slate-200">
                                    {grpFeeders.join(', ')}
                                  </strong>
                                </span>
                              </div>
                              <div className="font-mono font-bold text-white tabular-nums">
                                {slot.label}
                              </div>
                            </div>

                            {/* Official CEB Disconnection & Restoration Time Windows */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                              <div className="flex flex-col">
                                <span className="text-slate-400">
                                  Supply Disconnection Time (විසන්ධි කරන වේලාව):
                                </span>
                                <span className="font-mono text-rose-300 font-semibold mt-0.5">
                                  {slot.disconnectTime}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-400">
                                  Supply Restoration Time (යථා තත්ත්වයට පත් වන වේලාව):
                                </span>
                                <span className="font-mono text-emerald-300 font-semibold mt-0.5">
                                  {slot.restorationTime}
                                </span>
                              </div>
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
              In the event CEB takes demand management measures due to unavailability of Lakvijaya Power Station, supply interruption time and restoration duration may vary within 30 minutes as indicated above.
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

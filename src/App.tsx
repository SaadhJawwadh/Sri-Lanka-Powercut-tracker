/**
 * Sri Lanka CEB Power Cut Schedule & Interactive Grid Map
 * @license Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  GRID_SUBSTATIONS,
  DAY_SCHEDULES,
  GROUP_COLORS,
  getSubstationStatus,
  GridSubstation,
} from './data/powerCutData';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SriLankaMap } from './components/SriLankaMap';
import { StationModal } from './components/StationModal';
import { TimelineScrubber } from './components/TimelineScrubber';
import { ScheduleTableView } from './components/ScheduleTableView';
import { CebNoticeModal } from './components/CebNoticeModal';
import {
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-19');
  const [activeView, setActiveView] = useState<'map' | 'table'>('map');
  const [selectedStation, setSelectedStation] = useState<GridSubstation | null>(null);
  const [colorMode, setColorMode] = useState<'status' | 'group'>('status');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [stationListFilter, setStationListFilter] = useState<'affected' | 'all'>('all');

  // Default hour float: 17.5 (05:30 PM) so users can immediately inspect active power cut slots,
  // or switch to 1-click Real-Time SLST mode at any time.
  const [currentHourFloat, setCurrentHourFloat] = useState<number>(17.5);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  // Calculate Sri Lanka Standard Time (SLST, UTC+5:30)
  const getSriLankaTimeFloat = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const slDate = new Date(utc + 5.5 * 3600000);
    return slDate.getHours() + slDate.getMinutes() / 60 + slDate.getSeconds() / 3600;
  };

  // Real-time clock ticker when Live Mode is active
  useEffect(() => {
    if (!isLiveMode) return;
    setCurrentHourFloat(getSriLankaTimeFloat());
    const interval = setInterval(() => {
      setCurrentHourFloat(getSriLankaTimeFloat());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLiveMode]);

  const activeDay = DAY_SCHEDULES[selectedDate] || DAY_SCHEDULES['2026-10-19'];

  // Current active slot for the whole island
  const activeIslandSlot = activeDay.slots.find(
    (s) => currentHourFloat >= s.startHour && currentHourFloat < s.endHour
  );

  // Active cut substations right now
  const affectedSubstations = useMemo(() => {
    return GRID_SUBSTATIONS.filter(
      (s) => getSubstationStatus(s, selectedDate, currentHourFloat).state === 'cut_active'
    );
  }, [selectedDate, currentHourFloat]);

  const displayedStations = useMemo(() => {
    let base =
      stationListFilter === 'affected' && affectedSubstations.length > 0
        ? affectedSubstations
        : GRID_SUBSTATIONS;
    if (selectedGroupFilter !== 'all') {
      base = base.filter((s) =>
        s.groupFeeders.some((gf) => gf.group === selectedGroupFilter)
      );
    }
    return base;
  }, [stationListFilter, affectedSubstations, selectedGroupFilter]);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        activeView={activeView}
        onToggleView={setActiveView}
        onOpenNoticeModal={() => setIsNoticeOpen(true)}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5"
      >
        {/* Top Omni Search Bar */}
        <section aria-label="Substation and City Search" className="w-full">
          <SearchBar
            substations={GRID_SUBSTATIONS}
            onSelectStation={(station) => setSelectedStation(station)}
            selectedStation={selectedStation}
          />
        </section>

        {/* View Switching: Map View vs Table View */}
        {activeView === 'map' ? (
          <div className="flex flex-col gap-5">
            {/* Interactive Timeline Scrubber & Live Outage Bar */}
            <TimelineScrubber
              selectedDate={selectedDate}
              currentHourFloat={currentHourFloat}
              onChangeHourFloat={setCurrentHourFloat}
              isLiveMode={isLiveMode}
              onToggleLiveMode={() => {
                if (!isLiveMode) {
                  setCurrentHourFloat(getSriLankaTimeFloat());
                }
                setIsLiveMode(!isLiveMode);
              }}
            />

            {/* Split Screen Grid for Map and Quick Inspection Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Map Column (7 Cols on desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 h-[560px] sm:h-[620px] lg:h-[720px]">
                <SriLankaMap
                  substations={GRID_SUBSTATIONS}
                  selectedStation={selectedStation}
                  onSelectStation={(station) => setSelectedStation(station)}
                  selectedDate={selectedDate}
                  currentHourFloat={currentHourFloat}
                  colorMode={colorMode}
                  onChangeColorMode={setColorMode}
                  selectedGroupFilter={selectedGroupFilter}
                  onChangeGroupFilter={setSelectedGroupFilter}
                />
              </div>

              {/* Station Info / Quick Outage Summary Column (5 Cols on desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                {/* Active Disconnection Status Banner */}
                <div
                  aria-live="polite"
                  className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      National Demand Status
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activeDay.displayDate}
                    </span>
                  </div>

                  {activeIslandSlot ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" aria-hidden="true" />
                        <span className="font-bold text-white text-sm">
                          Group 0{activeIslandSlot.group} Blackout Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Scheduled slot: <strong className="font-mono text-rose-300">{activeIslandSlot.label}</strong>.
                      </p>
                      <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs flex items-center justify-between text-rose-200">
                        <span>Affected Substations:</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {affectedSubstations.length} / {GRID_SUBSTATIONS.length} Grid Stations
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 py-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      <span>All 4 Groups currently powered. Demand management cuts operate from 04:30 PM to 08:30 PM.</span>
                    </div>
                  )}
                </div>

                {/* Substation Spotlight / Complete Directory */}
                <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col min-h-[380px] overflow-hidden">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        {selectedGroupFilter === 'all'
                          ? `Grid Substations (${displayedStations.length})`
                          : `Group 0${selectedGroupFilter} Stations (${displayedStations.length})`}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedGroupFilter === 'all'
                          ? 'Select any station to inspect feeders & schedule'
                          : `Showing all Sri Lanka locations in Group 0${selectedGroupFilter}`}
                      </p>
                    </div>

                    {affectedSubstations.length > 0 && (
                      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] shrink-0">
                        <button
                          type="button"
                          onClick={() => setStationListFilter('all')}
                          className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                            stationListFilter === 'all'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          All ({GRID_SUBSTATIONS.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStationListFilter('affected')}
                          className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                            stationListFilter === 'affected'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Cut Active ({affectedSubstations.length})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scrollable list of all stations */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[380px] lg:max-h-[460px]">
                    {displayedStations.map((station) => {
                      const status = getSubstationStatus(station, selectedDate, currentHourFloat);
                      const isCut = status.state === 'cut_active';
                      const activeGroupObj =
                        selectedGroupFilter !== 'all'
                          ? station.groupFeeders.find((g) => g.group === selectedGroupFilter)
                          : undefined;

                      return (
                        <button
                          key={station.id}
                          type="button"
                          onClick={() => setSelectedStation(station)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left border border-transparent hover:border-slate-700/60 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
                              {station.groupFeeders.map((gf) => (
                                <span
                                  key={gf.group}
                                  className={`w-2.5 h-2.5 rounded-full ring-1 ring-slate-900 ${
                                    isCut && status.activeGroup === gf.group ? 'animate-ping' : ''
                                  }`}
                                  style={{
                                    backgroundColor: GROUP_COLORS[gf.group].hex,
                                  }}
                                />
                              ))}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                                {station.displayName}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {station.district} District ·{' '}
                                {activeGroupObj
                                  ? `G0${activeGroupObj.group} Feeders: ${activeGroupObj.feeders.join(', ')}`
                                  : `Groups ${station.groupFeeders.map((g) => `0${g.group}`).join(', ')}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCut ? (
                              <span className="text-[11px] font-mono font-bold text-rose-400">
                                Cut Active
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-400">
                                {station.groupFeeders.map((g) => `G0${g.group}`).join('/')}
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" aria-hidden="true" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Table View for Complete Verification and Printing */
          <ScheduleTableView
            substations={GRID_SUBSTATIONS}
            selectedDate={selectedDate}
            currentHourFloat={currentHourFloat}
            onSelectStation={(station) => {
              setSelectedStation(station);
              setActiveView('map');
            }}
          />
        )}
      </main>

      {/* Selected Substation Detailed Modal */}
      {selectedStation && (
        <StationModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          selectedDate={selectedDate}
          currentHourFloat={currentHourFloat}
        />
      )}

      {/* Official CEB Notice Modal */}
      {isNoticeOpen && <CebNoticeModal onClose={() => setIsNoticeOpen(false)} />}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#06090F] py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Ceylon Electricity Board (CEB) Demand Management Schedules · October 19–21, 2026
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>{GRID_SUBSTATIONS.length} Grid Substations</span>
            <span aria-hidden="true">·</span>
            <span>All 4 Outage Groups</span>
            <span aria-hidden="true">·</span>
            <span>25 Districts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

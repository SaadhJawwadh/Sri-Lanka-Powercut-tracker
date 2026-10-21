/**
 * Header Component
 * Strict 3-zone top bar contract for Sri Lanka CEB Power Cut Dashboard
 */

import React from 'react';
import { DAY_SCHEDULES } from '../data/powerCutData';
import { Zap, Table, Map, Calendar } from 'lucide-react';

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeView: 'map' | 'table';
  onToggleView: (view: 'map' | 'table') => void;
  onOpenNoticeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  activeView,
  onToggleView,
  onOpenNoticeModal,
}) => {
  const dates = Object.keys(DAY_SCHEDULES);

  return (
    <header className="w-full bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 md:gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#main-content"
          className="flex items-center gap-2 text-sm sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
        >
          <Zap className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" aria-hidden="true" />
          <span>Sri Lanka Power Cut Map</span>
        </a>

        {/* Zone 2: Date & View Navigation Links (Full width row on mobile, inline center on desktop) */}
        <nav
          aria-label="Schedule Dates and Views"
          className="order-3 md:order-2 w-full md:w-auto flex items-center justify-between md:justify-center gap-1.5 sm:gap-2 overflow-x-auto pt-1.5 md:pt-0 border-t border-slate-800/60 md:border-t-0"
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            {dates.map((dateKey) => {
              const isSelected = selectedDate === dateKey;
              const shortLabel =
                dateKey === '2026-10-19'
                  ? '19 Oct'
                  : dateKey === '2026-10-20'
                  ? '20 Oct'
                  : '21 Oct';

              return (
                <button
                  key={dateKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectDate(dateKey)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5 shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-pressed={activeView === 'map'}
              onClick={() => onToggleView('map')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                activeView === 'map'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Map</span>
            </button>

            <button
              type="button"
              aria-pressed={activeView === 'table'}
              onClick={() => onToggleView('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                activeView === 'table'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Table</span>
            </button>
          </div>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="order-2 md:order-3 flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenNoticeModal}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[36px] text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            CEB Notice
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * ScheduleTableView Component
 * Full searchable and filterable table reproducing the Ceylon Electricity Board (CEB)
 * Demand Management Schedule tables from the user's 11 uploaded photos.
 */

import React, { useState, useMemo } from 'react';
import {
  GridSubstation,
  DAY_SCHEDULES,
  GROUP_COLORS,
  getSubstationStatus,
} from '../data/powerCutData';
import { Search, ExternalLink } from 'lucide-react';

interface ScheduleTableViewProps {
  substations: GridSubstation[];
  selectedDate: string;
  currentHourFloat: number;
  onSelectStation: (station: GridSubstation) => void;
}

export const ScheduleTableView: React.FC<ScheduleTableViewProps> = ({
  substations,
  selectedDate,
  currentHourFloat,
  onSelectStation,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const schedule = DAY_SCHEDULES[selectedDate] || DAY_SCHEDULES['2026-10-19'];

  // All distinct districts
  const districts = useMemo(() => {
    const set = new Set(substations.map((s) => s.district));
    return Array.from(set).sort();
  }, [substations]);

  // Flattened table rows: each entry is a (Substation + Group + Feeders)
  const rows = useMemo(() => {
    const list: Array<{
      station: GridSubstation;
      group: number;
      feeders: string[];
      timeSlot?: (typeof schedule.slots)[0];
    }> = [];

    substations.forEach((station) => {
      station.groupFeeders.forEach((gf) => {
        if (selectedGroup !== 'all' && gf.group !== selectedGroup) return;
        if (selectedDistrict !== 'all' && station.district !== selectedDistrict) return;

        const q = filterQuery.toLowerCase().trim();
        if (q) {
          const matchName = station.name.toLowerCase().includes(q);
          const matchDistrict = station.district.toLowerCase().includes(q);
          const matchTown = station.townAliases.some((t) => t.toLowerCase().includes(q));
          const matchFeeder = gf.feeders.some((f) => f.toLowerCase().includes(q));
          if (!matchName && !matchDistrict && !matchTown && !matchFeeder) return;
        }

        const slot = schedule.slots.find((s) => s.group === gf.group);
        list.push({
          station,
          group: gf.group,
          feeders: gf.feeders,
          timeSlot: slot,
        });
      });
    });

    return list.sort((a, b) => a.station.name.localeCompare(b.station.name));
  }, [substations, selectedGroup, selectedDistrict, filterQuery, schedule]);

  return (
    <div className="w-full bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            aria-label="Filter schedule table by Grid Substation, feeder number, or town"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter table by GSS, feeder number, or town..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Group Filter Buttons */}
        <div
          role="group"
          aria-label="Filter by Outage Group"
          className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl"
        >
          <button
            type="button"
            aria-pressed={selectedGroup === 'all'}
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selectedGroup === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Groups
          </button>
          {([1, 2, 3, 4] as const).map((grp) => {
            const isSelected = selectedGroup === grp;
            const style = GROUP_COLORS[grp];
            return (
              <button
                key={grp}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.hex }} aria-hidden="true" />
                <span>Group 0{grp}</span>
              </button>
            );
          })}
        </div>

        {/* District Dropdown */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by Sri Lankan District"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th scope="col" className="py-3 px-4">Grid Substation (GSS)</th>
                <th scope="col" className="py-3 px-4">District</th>
                <th scope="col" className="py-3 px-4">Group</th>
                <th scope="col" className="py-3 px-4">Feeder Numbers</th>
                <th scope="col" className="py-3 px-4">Interruption Slot ({schedule.displayDate})</th>
                <th scope="col" className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No substations match your filter criteria.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const grpColor = GROUP_COLORS[row.group];
                  const status = getSubstationStatus(row.station, selectedDate, currentHourFloat);
                  const isCutNow =
                    status.state === 'cut_active' && status.activeGroup === row.group;

                  return (
                    <tr
                      key={`${row.station.id}-${row.group}-${index}`}
                      tabIndex={0}
                      onClick={() => onSelectStation(row.station)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectStation(row.station);
                        }
                      }}
                      className={`hover:bg-slate-800/60 focus-visible:outline-none focus-visible:bg-slate-800/80 cursor-pointer transition-colors ${
                        isCutNow ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* GSS Name */}
                      <td className="py-3 px-4 font-sans font-semibold text-white flex items-center gap-2">
                        {isCutNow && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" aria-hidden="true" />
                        )}
                        <span>{row.station.displayName}</span>
                        {row.station.sinhalaName && (
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({row.station.sinhalaName})
                          </span>
                        )}
                      </td>

                      {/* District */}
                      <td className="py-3 px-4 font-sans text-slate-300">
                        {row.station.district}
                      </td>

                      {/* Group */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={{
                            color: grpColor.hex,
                            backgroundColor: grpColor.bgRgba,
                          }}
                        >
                          Group 0{row.group}
                        </span>
                      </td>

                      {/* Feeder Numbers */}
                      <td className="py-3 px-4 text-slate-200">
                        <div className="flex flex-wrap gap-1">
                          {row.feeders.map((fdr) => (
                            <span
                              key={fdr}
                              className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300"
                            >
                              {fdr}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Interruption Time */}
                      <td className="py-3 px-4 text-slate-300 tabular-nums">
                        {row.timeSlot ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {row.timeSlot.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {row.timeSlot.disconnectTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-sans">Not scheduled</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStation(row.station);
                          }}
                          className="px-2.5 py-1 text-[11px] text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

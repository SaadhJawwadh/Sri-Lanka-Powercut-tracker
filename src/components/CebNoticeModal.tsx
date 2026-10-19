/**
 * CebNoticeModal Component
 * Official notice details from Ceylon Electricity Board in Sinhala and English.
 */

import React, { useEffect } from 'react';
import { CEB_NOTICE_INFO } from '../data/powerCutData';
import { X, ShieldAlert } from 'lucide-react';

interface CebNoticeModalProps {
  onClose: () => void;
}

export const CebNoticeModal: React.FC<CebNoticeModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ceb-notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="ceb-notice-title" className="text-base font-bold text-white">
                CEB Official Notice
              </h3>
              <p className="text-xs text-slate-400">Ceylon Electricity Board Demand Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Official Notice"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {/* Sinhala Notice */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="font-bold text-amber-300 text-sm">{CEB_NOTICE_INFO.titleSi}</div>
            <p className="text-slate-200 leading-relaxed">{CEB_NOTICE_INFO.causeSi}</p>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-400 text-[11px] leading-normal">
              {CEB_NOTICE_INFO.noteSi}
            </div>
          </div>

          {/* English Notice */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="font-bold text-white text-sm">{CEB_NOTICE_INFO.titleEn}</div>
            <p className="text-slate-300 leading-relaxed">{CEB_NOTICE_INFO.causeEn}</p>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-400 text-[11px] leading-normal">
              {CEB_NOTICE_INFO.noteEn}
            </div>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">Peak Window</span>
              <strong className="text-white font-mono">04:30 PM – 08:30 PM</strong>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">Cut Duration</span>
              <strong className="text-white font-mono">1 Hour per Group</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCode, Search, CheckCircle, AlertTriangle, ShieldAlert, Info, Database, Layers, Terminal, ArrowDown } from 'lucide-react';
import { RpaLog, LogType } from '../types';

interface EventJournalProps {
  logs: RpaLog[];
  onClearLogs?: () => void;
}

export default function EventJournal({ logs, onClearLogs }: EventJournalProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'success' | 'info' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const journalEndRef = useRef<HTMLDivElement>(null);

  // Filter logs based on search input and selected log type category
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Direct category map
      const matchesType =
        selectedFilter === 'all' ||
        (selectedFilter === 'success' && log.type === 'success') ||
        (selectedFilter === 'info' && log.type === 'info') ||
        (selectedFilter === 'warning' && log.type === 'warning') ||
        (selectedFilter === 'error' && log.type === 'error');

      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [logs, selectedFilter, searchTerm]);

  // Handle auto-scroll to the bottom of the audit journal
  useEffect(() => {
    if (autoScroll && journalEndRef.current) {
      journalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  // Statistics counts for badges
  const stats = useMemo(() => {
    return {
      all: logs.length,
      success: logs.filter(l => l.type === 'success').length,
      info: logs.filter(l => l.type === 'info').length,
      warning: logs.filter(l => l.type === 'warning').length,
      error: logs.filter(l => l.type === 'error').length,
    };
  }, [logs]);

  // Helper to render type icons & colors
  const getTypeMeta = (type: LogType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/25',
          text: 'text-emerald-700 dark:text-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          label: 'SUCCESS',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/25',
          text: 'text-amber-700 dark:text-amber-400',
          badgeBg: 'bg-amber-100 text-amber-800',
          label: 'WARNING',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10 border-rose-500/25',
          text: 'text-rose-700 dark:text-rose-400',
          badgeBg: 'bg-rose-100 text-rose-800',
          label: 'ERROR',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10 border-blue-500/25',
          text: 'text-blue-700 dark:text-blue-400',
          badgeBg: 'bg-blue-100 text-blue-800',
          label: 'INFO',
          icon: <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        };
      case 'command':
        return {
          bg: 'bg-slate-500/10 border-slate-500/25',
          text: 'text-slate-600 dark:text-slate-300',
          badgeBg: 'bg-slate-100 text-slate-850',
          label: 'COMMAND',
          icon: <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-600',
          badgeBg: 'bg-slate-100 text-slate-800',
          label: 'LOG',
          icon: <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        };
    }
  };

  return (
    <div id="journal-des-evenements" className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-xs space-y-4">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-700 rounded-lg border border-indigo-200/40">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              Journal d'Audit des Événements RPA
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Historique complet & Traçabilité légale réglementaire (Jury)</p>
          </div>
        </div>
        
        {/* Helper interactive status actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-1 text-[10px] text-slate-500 select-none cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3 border-slate-300"
            />
            Auto-scroll
          </label>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[9px] font-bold text-slate-400 hover:text-rose-500 transition px-2 py-1 rounded hover:bg-rose-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter and search segment */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch sm:items-center justify-between text-xs font-sans">
        {/* Filter categories buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
          <button
            id="filter-btn-all"
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tous ({stats.all})
          </button>
          
          <button
            id="filter-btn-success"
            onClick={() => setSelectedFilter('success')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'success'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Succès ({stats.success})
          </button>

          <button
            id="filter-btn-info"
            onClick={() => setSelectedFilter('info')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'info'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Infos ({stats.info})
          </button>

          <button
            id="filter-btn-warning"
            onClick={() => setSelectedFilter('warning')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'warning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            Alertes ({stats.warning})
          </button>

          <button
            id="filter-btn-error"
            onClick={() => setSelectedFilter('error')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'error'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Échecs ({stats.error})
          </button>
        </div>

        {/* Text Filter Input */}
        <div className="relative flex-1 max-w-xs md:w-48">
          <input
            id="journal-search-input"
            type="text"
            placeholder="Rechercher un message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder-slate-400 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Logs Event Feed */}
      <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
        <div className="h-[200px] overflow-y-auto p-3.5 space-y-2 text-[10.5px] font-mono custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
              <Layers className="w-8 h-8 opacity-40 animate-pulse text-indigo-300" />
              <p className="font-sans text-[11px]">Aucun enregistrement ne correspond aux filtres.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {filteredLogs.map((log) => {
                  const meta = getTypeMeta(log.type);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border ${meta.bg} transition duration-150`}
                    >
                      {/* Left vertical type line decorative */}
                      <div className="flex items-center gap-1.5 shrink-0 select-none">
                        <span className="text-slate-400 text-[9px] min-w-[50px] font-bold">
                          {log.timestamp}
                        </span>
                        {meta.icon}
                      </div>

                      {/* Msg Body */}
                      <div className="flex-1 text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {log.message}
                      </div>

                      {/* Platform source badge or category tag badge */}
                      {log.platform && (
                        <span className="text-[8px] bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase self-center tracking-wider select-none shrink-0 font-sans">
                          {log.platform}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
          <div ref={journalEndRef} />
        </div>
      </div>

      {/* Operational guidelines legend */}
      <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans">
        <span>Statut de conformité : <strong>ISO-27001 Audit Ready</strong></span>
        <span>Mises à jour des logs RPA en temps réel</span>
      </div>
    </div>
  );
}

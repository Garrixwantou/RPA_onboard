/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { CheckCircle, Clock, Zap, Cpu } from 'lucide-react';
import { Collaborator } from '../types';

interface DashboardStatsProps {
  collaborators: Collaborator[];
}

export default function DashboardStats({ collaborators }: DashboardStatsProps) {
  // 1. Success rate data (static high quality industry targets vs current run)
  const successRateData = [
    { name: 'Réussis', value: 98.4, color: '#10b981' },
    { name: 'Échecs avec Rollback', value: 1.6, color: '#ef4444' },
  ];

  // 2. Process durations data (SaaS automation speeds compared to manual operations)
  const durationData = [
    { name: 'Email (ProMail)', Robot: 4.5, Humain: 25.0 },
    { name: 'Stockage (Vault)', Robot: 3.2, Humain: 15.0 },
    { name: 'Chat (CollabChat)', Robot: 3.8, Humain: 18.0 },
  ];

  // 3. Platform distribution data active from collaborators structure
  const activeEmailCount = collaborators.filter(c => c.status === 'active' && c.platforms.email).length;
  const activeStorageCount = collaborators.filter(c => c.status === 'active' && c.platforms.storage).length;
  const activeChatCount = collaborators.filter(c => c.status === 'active' && c.platforms.chat).length;

  const platformDistributionData = [
    { name: 'ProMail', value: activeEmailCount, color: '#1e293b' },
    { name: 'CloudVault', value: activeStorageCount, color: '#475569' },
    { name: 'CollabChat', value: activeChatCount, color: '#94a3b8' },
  ];

  // Count active vs inactive collaborators for sub indicators
  const totalActive = collaborators.filter(c => c.status === 'active').length;
  const totalRevoked = collaborators.filter(c => c.status === 'inactive').length;

  return (
    <div id="dashboard-stats-section" className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-slate-800" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Performance & Métriques d'Orchestration RPA
          </h3>
        </div>
        <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-mono font-bold py-0.5 px-2 rounded-full flex items-center gap-1 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
          Télémétrie Live
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Taux de Succès RPA</span>
            <div className="text-sm font-extrabold text-slate-900">98.4 %</div>
            <span className="text-[9px] text-slate-500 block">Sélecteurs résilients actifs</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Vitesse Moyenne</span>
            <div className="text-sm font-extrabold text-slate-900">11.5 Secondes</div>
            <span className="text-[9px] text-slate-500 block">Gain de temps de 82%</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Reconciliation Acteurs</span>
            <div className="text-sm font-extrabold text-slate-900">{totalActive} Actifs / {totalRevoked} Clôturés</div>
            <span className="text-[9px] text-slate-500 block">Registre d'identité unifié</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Chart 1: Process speeds comparison Robot vs Manual */}
        <div className="border border-slate-100 rounded-lg p-3 space-y-2 bg-slate-50/30">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
            Comparatif de Durée d'Exécution (sec - Robot vs Humain)
          </span>
          <div className="h-[180px] w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={durationData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#888888" fontSize={9} />
                <YAxis stroke="#888888" fontSize={9} label={{ value: 'secs', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '6px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 10 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="Robot" fill="#0f172a" radius={[4, 4, 0, 0]} name="Temps Robot AI-RPA" />
                <Bar dataKey="Humain" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Temps Humain Manuel" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-400 block text-center italic">
            Mesure effectif hors sas de temporisation de fluidité visuel de démo.
          </span>
        </div>

        {/* Chart 2: Platform Distribution */}
        <div className="border border-slate-100 rounded-lg p-3 space-y-2 bg-slate-50/30">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
            Répartition des Droits de Comptes Actifs par Plateforme
          </span>
          <div className="h-[180px] w-full text-[10px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '6px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-400 block text-center font-medium">
            ProMail : {activeEmailCount} | CloudVault : {activeStorageCount} | CollabChat : {activeChatCount}
          </span>
        </div>

      </div>
    </div>
  );
}

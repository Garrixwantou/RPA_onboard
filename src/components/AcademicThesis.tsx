/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Code2, ShieldAlert, CheckCircle, Copy, Check, ListChecks, HelpCircle } from 'lucide-react';
import { PUPPETEER_SCRIPT, SELENIUM_SCRIPT, ACADEMIC_PROBLEM_ANSWER } from '../data/rpaScripts';

export default function AcademicThesis() {
  const [activeTab, setActiveTab] = useState<'problem' | 'puppeteer' | 'selenium'>('problem');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="academic-thesis-section" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Dossier de Soutenance Académique — RPA</h2>
        </div>
        <p className="text-xs text-gray-500">
          Matériel de démonstration pour le jury de mémoire sous la spécialité <span className="font-semibold text-indigo-700">Automatisation & RPA</span>.
        </p>
      </div>

      {/* Navigation Inside Academic Tab */}
      <div className="flex border-b border-gray-200 text-xs font-semibold">
        <button
          id="btn-tab-problem"
          onClick={() => setActiveTab('problem')}
          className={`pb-2.5 px-4 -mb-[1px] transition ${
            activeTab === 'problem'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Problématique de Recherche
        </button>
        <button
          id="btn-tab-puppeteer"
          onClick={() => setActiveTab('puppeteer')}
          className={`pb-2.5 px-4 -mb-[1px] transition flex items-center gap-1.5 ${
            activeTab === 'puppeteer'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Code Robot (Puppeteer)
        </button>
        <button
          id="btn-tab-selenium"
          onClick={() => setActiveTab('selenium')}
          className={`pb-2.5 px-4 -mb-[1px] transition flex items-center gap-1.5 ${
            activeTab === 'selenium'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Code Robot (Selenium Python)
        </button>
      </div>

      {/* 2. TAB VALUES CONTENT */}
      <div className="text-xs text-gray-600 leading-relaxed">
        {activeTab === 'problem' && (
          <div className="space-y-5 animate-fade-in">
            {/* Academic Problem Statement Callout */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 space-y-2.5">
              <span className="inline-flex items-center gap-1 font-bold text-indigo-800 uppercase text-[9px] tracking-wider bg-indigo-100/60 px-2 py-0.5 rounded">
                <HelpCircle className="w-3 h-3" /> Question Clé du Mémoire
              </span>
              <h3 className="text-sm font-bold text-indigo-950">
                « {ACADEMIC_PROBLEM_ANSWER.question} »
              </h3>
              <p className="text-gray-700 text-[11px] leading-relaxed">
                {ACADEMIC_PROBLEM_ANSWER.coreProblem}
              </p>
            </div>

            {/* Strategy Items */}
            <div>
              <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wider mb-3 text-indigo-900 flex items-center gap-1">
                <ListChecks className="w-4 h-4" /> Stratégies de Robustesse Présentées
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {ACADEMIC_PROBLEM_ANSWER.strategies.map((strategy, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3.5 space-y-1.5 hover:border-indigo-100 hover:shadow-xs transition">
                    <h5 className="font-semibold text-gray-950 text-xs flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {strategy.title}
                    </h5>
                    <p className="text-gray-500 text-[10px] leading-relaxed">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anchor Selection Comparison visual */}
            <div className="border border-gray-100 rounded-lg p-4 space-y-3 bg-slate-50/50">
              <h4 className="font-bold text-gray-900 text-xs">Comparatif d'Ingénierie de Sélecteurs RPA</h4>
              <div className="grid md:grid-cols-2 gap-4 text-[10px]">
                <div className="bg-red-50/40 border border-red-100 rounded p-3 space-y-1">
                  <span className="text-red-700 font-bold uppercase text-[8px] tracking-wide">Méthode Fragile (À proscrire)</span>
                  <p className="font-mono text-gray-600 bg-red-50/70 p-1.5 rounded truncate">/html/body/div[2]/form/div[3]/input</p>
                  <p className="text-gray-400">Échoue à 100% à la moindre modification CSS, réorganisation de divs, ou design adaptatif mobile.</p>
                </div>
                <div className="bg-emerald-50/40 border border-emerald-100 rounded p-3 space-y-1">
                  <span className="text-emerald-700 font-bold uppercase text-[8px] tracking-wide">Méthode Résiliente (Notre Solution)</span>
                  <p className="font-mono text-emerald-800 bg-emerald-50/70 p-1.5 rounded truncate">//button[@aria-label="Add User"] | .create-user-trigger</p>
                  <p className="text-gray-600">Combine la recherche d'attributs sémantiques stables et l'ancrage textuel de secours.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'puppeteer' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span>Script autonome d'Onboarding / Offboarding (NodeJS)</span>
              </div>
              <button
                id="btn-copy-puppet"
                onClick={() => handleCopyCode(PUPPETEER_SCRIPT)}
                className="bg-white hover:bg-gray-100 border border-gray-200 rounded px-2.5 py-1 flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#1e1f29] text-[#a9b2c3] p-4 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed h-[350px] shadow-inner custom-scrollbar select-text">
              <code>{PUPPETEER_SCRIPT}</code>
            </pre>
          </div>
        )}

        {activeTab === 'selenium' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Script d'Orchestration Selenium (Python)</span>
              </div>
              <button
                id="btn-copy-selenium"
                onClick={() => handleCopyCode(SELENIUM_SCRIPT)}
                className="bg-white hover:bg-gray-100 border border-gray-200 rounded px-2.5 py-1 flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#1e1f29] text-[#a9b2c3] p-4 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed h-[350px] shadow-inner custom-scrollbar select-text">
              <code>{SELENIUM_SCRIPT}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

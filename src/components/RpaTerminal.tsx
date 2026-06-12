/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, HelpCircle, FileText, Trash2, Command, ShieldAlert, RotateCcw } from 'lucide-react';
import { RpaLog } from '../types';

interface RpaTerminalProps {
  logs: RpaLog[];
  onAddLog: (log: RpaLog) => void;
  onClearLogs: () => void;
  onTriggerOnboard: (firstname: string, lastname: string, email: string, role: string, department: string) => void;
  onTriggerOffboard: (email: string) => void;
  isSimulating?: boolean;
  onUndoLastAction?: () => void;
}

export default function RpaTerminal({
  logs,
  onAddLog,
  onClearLogs,
  onTriggerOnboard,
  onTriggerOffboard,
  isSimulating = false,
  onUndoLastAction,
}: RpaTerminalProps) {
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLocalCommandLog = (cmd: string) => {
    const timestamp = new Date().toLocaleTimeString();
    onAddLog({
      id: Math.random().toString(),
      timestamp,
      type: 'command',
      message: `rpa-operator@saas-gateway:~$ ${cmd}`
    });
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCmd = commandInput.trim();
    if (!trimmedCmd) return;

    // Save to history
    setHistory(prev => [trimmedCmd, ...prev]);
    setHistoryIndex(-1);
    setCommandInput('');

    // Print command command line in logs
    addLocalCommandLog(trimmedCmd);

    // Parse command
    processCommand(trimmedCmd);
  };

  const processCommand = (cmd: string) => {
    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    if (baseCmd === 'clear') {
      onClearLogs();
      return;
    }

    if (baseCmd === 'undo' || baseCmd === 'annuler' || baseCmd === 'rpa-undo') {
      if (onUndoLastAction) {
        onUndoLastAction();
      } else {
        onAddLog({
          id: Math.random().toString(),
          timestamp,
          type: 'warning',
          message: `⚠ Aucun processus d'Onboarding en cours d'exécution à annuler.`
        });
      }
      return;
    }

    if (baseCmd === 'help') {
      onAddLog({
        id: Math.random().toString(),
        timestamp,
        type: 'info',
        message: `📜 Commandes d'automatisation RPA disponibles :\n` +
          `  • help : Affiche cette aide.\n` +
          `  • clear : Nettoie l'écran du terminal.\n` +
          `  • rpa-onboard --first <prenom> --last <nom> --email <adresse> --role <poste> --dept <dept> : Déclenche le scénario visuel assisté d'Onboarding RPA.\n` +
          `  • rpa-onboard --demo : Raccourci pour lancer l'action d'Onboarding de démonstration (Thomas Durand).\n` +
          `  • rpa-undo : Annule la dernière action de l'onboarding en cours (Rollback Compensatoire).\n` +
          `  • rpa-offboard --email <adresse> : Déclenche l'Offboarding (fermeture de l'ensemble des comptes et espaces).\n` +
          `  • rpa-offboard --demo : Raccourci pour désactiver le compte Thomas Durand.\n` +
          `  • academic : Résumé synthétique de la problématique de recherche abordée devant le jury.`
      });
      return;
    }

    if (baseCmd === 'academic') {
      onAddLog({
        id: Math.random().toString(),
        timestamp,
        type: 'success',
        message: `🛡 PROBLÉMATIQUE DE RECHERCHE ACADÉMIQUE :\n` +
          `Question : "Comment orchestrer des scénarios RPA robustes sans API natives ?"\n` +
          `Solution démontrée : Ce robot simule l'interaction humaine sur des interfaces SaaS hétérogènes (Email, Stockage, Chat) en injectant de la résilience dynamique (Cascade d'ancrage XPath, Expected Conditions sans sleep rigide, transactionnalité avec rollback compensatoire).`
      });
      return;
    }

    if (baseCmd === 'rpa-onboard') {
      // Check for demo flag
      if (cmd.includes('--demo') || cmd.includes('-demo')) {
        onTriggerOnboard('Thomas', 'Durand', 't.durand@entreprise-rpa.com', 'Ingénieur Systèmes', 'R&D');
        return;
      }

      // Parse flags manually
      let first = '';
      let last = '';
      let email = '';
      let role = 'Collaborateur';
      let dept = 'Opérations';

      for (let i = 1; i < parts.length; i++) {
        if (parts[i] === '--first' || parts[i] === '-f') first = parts[i + 1] || '';
        if (parts[i] === '--last' || parts[i] === '-l') last = parts[i + 1] || '';
        if (parts[i] === '--email' || parts[i] === '-e') email = parts[i + 1] || '';
        if (parts[i] === '--role' || parts[i] === '-r') role = parts[i + 1] || 'Collaborateur';
        if (parts[i] === '--dept' || parts[i] === '-d') dept = parts[i + 1] || 'Opérations';
      }

      // Basic cleanup of quote marks if typed
      first = first.replace(/['"]/g, '');
      last = last.replace(/['"]/g, '');
      email = email.replace(/['"]/g, '');
      role = role.replace(/['"]/g, '');
      dept = dept.replace(/['"]/g, '');

      if (!first || !last || !email) {
        onAddLog({
          id: Math.random().toString(),
          timestamp,
          type: 'error',
          message: `❌ Syntaxe incorrecte. Spécifiez au minimum --first, --last et --email ou utilisez "rpa-onboard --demo".\nSyntaxe : rpa-onboard --first Jean --last Dupont --email j.dupont@entreprise.com`
        });
        return;
      }

      onTriggerOnboard(first, last, email, role, dept);
      return;
    }

    if (baseCmd === 'rpa-offboard') {
      if (cmd.includes('--demo') || cmd.includes('-demo')) {
        onTriggerOffboard('t.durand@entreprise-rpa.com');
        return;
      }

      let email = '';
      for (let i = 1; i < parts.length; i++) {
        if (parts[i] === '--email' || parts[i] === '-e') {
          email = parts[i + 1] || '';
        }
      }
      email = email.replace(/['"]/g, '');

      if (!email && parts[1] && !parts[1].startsWith('-')) {
        email = parts[1]; // fallback standard without flag
      }

      if (!email) {
        onAddLog({
          id: Math.random().toString(),
          timestamp,
          type: 'error',
          message: `❌ L'adresse email est requise. Syntaxe : rpa-offboard --email j.dupont@entreprise.com`
        });
        return;
      }

      onTriggerOffboard(email);
      return;
    }

    // Default error
    onAddLog({
      id: Math.random().toString(),
      timestamp,
      type: 'warning',
      message: `⚠ Commande non reconnue : "${baseCmd}". Saisissez "help" pour voir la documentation.`
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCommandInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setCommandInput(cmd);
  };

  return (
    <div id="terminal-section" className="bg-[#121620] border border-[#242e42] rounded-xl flex flex-col h-[350px] shadow-lg overflow-hidden font-mono text-xs text-gray-300">
      {/* Terminal Title Bar */}
      <div className="bg-[#19202f] px-4 py-2 border-b border-[#242e42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-gray-200">Terminal d'Orchestration RPA Gateway</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text custom-scrollbar">
        <div className="text-gray-500 leading-relaxed text-[11px] border-b border-[#1e2736] pb-2 mb-2">
          [RPA CLIENT CLI-V1.0.4] Connecté à la passerelle d'automatisation locale.<br />
          Saisissez <span className="text-emerald-400 font-bold">help</span> pour lister les fonctions autonomes de provisionnement.
        </div>
        
        {logs.map((log) => {
          let textClass = 'text-gray-300';
          let prefix = '';

          if (log.type === 'command') {
            textClass = 'text-yellow-400 font-semibold';
          } else if (log.type === 'success') {
            textClass = 'text-emerald-400';
            prefix = '✔ ';
          } else if (log.type === 'error') {
            textClass = 'text-red-400 font-medium';
            prefix = '⚡ ERROR: ';
          } else if (log.type === 'warning') {
            textClass = 'text-amber-400';
            prefix = '⚠ ';
          } else if (log.type === 'info') {
            textClass = 'text-cyan-400';
          }

          return (
            <div key={log.id} className="whitespace-pre-wrap leading-relaxed">
              <span className="text-gray-600 mr-2 text-[10px] select-none">[{log.timestamp}]</span>
              <span className={textClass}>{prefix}{log.message}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Pre-configured interactive command suggestions for Stress-Free demonstration */}
      <div className="bg-[#141926] px-4 py-1.5 border-t border-[#1e2736] flex flex-wrap items-center gap-2 select-none">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <Command className="w-3.5 h-3.5" />
          Accès rapide :
        </span>
        <button
          id="btn-cmd-demo-onboard"
          onClick={() => handleQuickCommand('rpa-onboard --demo')}
          className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 rounded px-2 py-0.5 hover:bg-emerald-900/40 hover:text-emerald-200 transition text-[10px] font-mono cursor-pointer flex items-center gap-1"
        >
          <Play className="w-2.5 h-2.5" /> Onboarding Démo
        </button>
        <button
          id="btn-cmd-demo-offboard"
          onClick={() => handleQuickCommand('rpa-offboard --demo')}
          className="bg-red-950/40 text-red-300 border border-red-900/60 rounded px-2 py-0.5 hover:bg-red-900/40 hover:text-red-200 transition text-[10px] font-mono cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-2.5 h-2.5" /> Offboarding Démo
        </button>
        <button
          id="btn-cmd-help"
          onClick={() => handleQuickCommand('help')}
          className="bg-slate-800/40 text-cyan-300 border border-cyan-900/60 rounded px-2 py-0.5 hover:bg-slate-800/60 transition text-[10px] font-mono cursor-pointer flex items-center gap-1"
        >
          <HelpCircle className="w-2.5 h-2.5" /> Code Aide
        </button>
        <button
          id="btn-cmd-academic"
          onClick={() => handleQuickCommand('academic')}
          className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/60 rounded px-2 py-0.5 hover:bg-indigo-950/60 transition text-[10px] font-mono cursor-pointer flex items-center gap-1 mx-auto sm:ml-auto"
        >
          <HelpCircle className="w-2.5 h-2.5" /> Problème Mémoire
        </button>
      </div>

      {/* Pulsing undo banner during simulation */}
      {isSimulating && onUndoLastAction && (
        <div className="bg-amber-950/45 border-t border-b border-amber-800/40 px-4 py-2 flex items-center justify-between text-[11px] text-amber-300 animate-pulse select-none shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>Simulation RPA d’Onboarding active...</span>
          </div>
          <button
            type="button"
            id="btn-undo-rollback"
            onClick={onUndoLastAction}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Annuler l'action (Rollback RPA)
          </button>
        </div>
      )}

      {/* Terminal Input Bar */}
      <form onSubmit={handleCommandSubmit} className="bg-[#171d2b] p-3 border-t border-[#242e42] flex items-center gap-2">
        <span className="text-emerald-500 font-bold select-none whitespace-nowrap">rpa-operator@saas-gateway:~$</span>
        <input
          id="cli-command-input"
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: rpa-onboard --first Jean --last Dupont --email j.dupont@co.com"
          className="flex-1 bg-transparent border-none text-lime-400 outline-none caret-lime-400 text-xs font-mono"
        />
        <button
          id="btn-terminal-submit"
          type="submit"
          className="bg-emerald-600 text-[#121620] hover:bg-emerald-500 transition font-bold px-3 py-1 rounded select-none cursor-pointer text-[10px]"
        >
          RUN
        </button>
      </form>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mail, HardDrive, MessageSquare, ArrowLeft, ArrowRight, RotateCw, Globe, Search, UserCheck, Shield, ChevronRight, FolderPlus } from 'lucide-react';
import { RpaPlatform, Collaborator, SimulationStep } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BrowserSimulatorProps {
  activePlatform: RpaPlatform;
  collaborators: Collaborator[];
  isSimulating: boolean;
  simulationStep: number;
  simulationSteps: SimulationStep[];
  currentInputText: { field: string; value: string };
  cursorPos: { x: number; y: number };
  cursorState: 'idle' | 'moving' | 'typing' | 'clicking';
  highlightedElementId: string | null;
  onSetPlatform: (platform: RpaPlatform) => void;
  tempSimulatedUser?: { firstname: string; lastname: string; email: string; role: string; department: string } | null;
}

export default function BrowserSimulator({
  activePlatform,
  collaborators,
  isSimulating,
  simulationStep,
  simulationSteps,
  currentInputText,
  cursorPos,
  cursorState,
  highlightedElementId,
  onSetPlatform,
  tempSimulatedUser,
}: BrowserSimulatorProps) {

  // For nice visuals, let's keep internal mock databases for the systems.
  // When simulation completes an action, we visual-sync.
  const [promailUsers, setPromailUsers] = useState<any[]>([
    { id: '1', firstname: 'Martin', lastname: 'Lucas', email: 'm.lucas@entreprise-rpa.com', role: 'Support Client', status: 'Actif' },
    { id: '2', firstname: 'Sophie', lastname: 'Dubois', email: 's.dubois@entreprise-rpa.com', role: 'Product Owner', status: 'Actif' },
  ]);

  const [vaultFolders, setVaultFolders] = useState<any[]>([
    { id: '1', name: 'partage-lucas', owner: 'm.lucas@entreprise-rpa.com', quota: '10 GB', filesCount: 14 },
    { id: '2', name: 'partage-dubois', owner: 's.dubois@entreprise-rpa.com', quota: '50 GB', filesCount: 89 },
  ]);

  const [chatMembers, setChatMembers] = useState<any[]>([
    { id: '1', email: 'm.lucas@entreprise-rpa.com', fullname: 'Martin Lucas', presence: 'online', status: 'Membre' },
    { id: '2', email: 's.dubois@entreprise-rpa.com', fullname: 'Sophie Dubois', presence: 'offline', status: 'Membre' },
  ]);

  // Synchronize base mock databases with the incoming collaborators from parent app
  useEffect(() => {
    // ProMail users
    const activeOnProMail = collaborators.filter(c => c.status === 'active' && c.platforms.email);
    const combinedProMail = [
      { id: '1', firstname: 'Martin', lastname: 'Lucas', email: 'm.lucas@entreprise-rpa.com', role: 'Support Client', status: 'Actif' },
      { id: '2', firstname: 'Sophie', lastname: 'Dubois', email: 's.dubois@entreprise-rpa.com', role: 'Product Owner', status: 'Actif' },
    ];
    activeOnProMail.forEach(c => {
      if (!combinedProMail.some(u => u.email === c.email)) {
        combinedProMail.push({
          id: c.id,
          firstname: c.firstname,
          lastname: c.lastname,
          email: c.email,
          role: c.role,
          status: 'Actif'
        });
      }
    });

    if (tempSimulatedUser && simulationStep >= 7) {
      if (!combinedProMail.some(u => u.email === tempSimulatedUser.email)) {
        combinedProMail.push({
          id: 'temp-promail-user',
          firstname: tempSimulatedUser.firstname,
          lastname: tempSimulatedUser.lastname,
          email: tempSimulatedUser.email,
          role: tempSimulatedUser.role || 'Collaborateur',
          status: 'Actif'
        });
      }
    }
    setPromailUsers(combinedProMail);

    // Vault Folders
    const activeOnVault = collaborators.filter(c => c.status === 'active' && c.platforms.storage);
    const combinedFolders = [
      { id: '1', name: 'partage-lucas', owner: 'm.lucas@entreprise-rpa.com', quota: '10 GB', filesCount: 14 },
      { id: '2', name: 'partage-dubois', owner: 's.dubois@entreprise-rpa.com', quota: '50 GB', filesCount: 89 },
    ];
    activeOnVault.forEach(c => {
      if (!combinedFolders.some(f => f.owner === c.email)) {
        combinedFolders.push({
          id: c.id,
          name: `partage-${c.lastname.toLowerCase()}`,
          owner: c.email,
          quota: '25 GB',
          filesCount: 0
        });
      }
    });

    if (tempSimulatedUser && simulationStep >= 13) {
      if (!combinedFolders.some(f => f.owner === tempSimulatedUser.email)) {
        combinedFolders.push({
          id: 'temp-vault-folder',
          name: `partage-${tempSimulatedUser.lastname.toLowerCase()}`,
          owner: tempSimulatedUser.email,
          quota: '25 GB',
          filesCount: 0
        });
      }
    }
    setVaultFolders(combinedFolders);

    // Chat Members
    const activeInChat = collaborators.filter(c => c.status === 'active' && c.platforms.chat);
    const combinedChat = [
      { id: '1', email: 'm.lucas@entreprise-rpa.com', fullname: 'Martin Lucas', presence: 'online', status: 'Membre' },
      { id: '2', email: 's.dubois@entreprise-rpa.com', fullname: 'Sophie Dubois', presence: 'offline', status: 'Membre' },
    ];
    activeInChat.forEach(c => {
      if (!combinedChat.some(m => m.email === c.email)) {
        combinedChat.push({
          id: c.id,
          email: c.email,
          fullname: `${c.firstname} ${c.lastname}`,
          presence: 'online',
          status: 'Membre'
        });
      }
    });
    setChatMembers(combinedChat);
  }, [collaborators, tempSimulatedUser, simulationStep]);

  // URL display depending on active tab
  const getUrl = () => {
    switch (activePlatform) {
      case 'PROMAIL':
        return 'https://promail-admin.secure-entreprise.internal/users';
      case 'CLOUD_VAULT':
        return 'https://cloudvault-admin.secure-entreprise.internal/folders';
      case 'COLLAB_CHAT':
        return 'https://workspace-chat.secure-entreprise.internal/admin/members';
    }
  };

  // State to accumulate and persist typed inputs during the RPA simulation
  const [simForm, setSimForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    foldername: '',
    inviteEmail: ''
  });

  // Floating key bubbles emanating from the laser cursor
  const [floatingKeys, setFloatingKeys] = useState<{ id: string; char: string; x: number; y: number }[]>([]);
  const prevValRef = useRef('');

  // Track the typewriter typing and accumulate text entries persistently
  useEffect(() => {
    if (isSimulating) {
      if (currentInputText.field) {
        setSimForm(prev => ({
          ...prev,
          [currentInputText.field]: currentInputText.value
        }));

        // Determine if a character has been added to spawn a floating key bubble
        if (currentInputText.value.length > prevValRef.current.length) {
          const newChar = currentInputText.value.slice(-1);
          const id = Math.random().toString();
          
          setFloatingKeys(prev => [
            ...prev,
            { id, char: newChar, x: cursorPos.x, y: cursorPos.y }
          ]);

          // Clear floating key bubble from state after completion
          setTimeout(() => {
            setFloatingKeys(prev => prev.filter(k => k.id !== id));
          }, 1100);
        }
      }
    } else {
      // Clear values when simulation is not running
      setSimForm({
        firstname: '',
        lastname: '',
        email: '',
        foldername: '',
        inviteEmail: ''
      });
      setFloatingKeys([]);
    }
    prevValRef.current = currentInputText.value;
  }, [currentInputText, isSimulating, cursorPos]);

  // Input states mapped directly from the persistent simulator form
  const typedFirstname = simForm.firstname;
  const typedLastname = simForm.lastname;
  const typedEmail = simForm.email;
  const typedFolderName = simForm.foldername;
  const typedInviteEmail = simForm.inviteEmail;

  // Return step highlight triggers helper
  const isHighlighted = (elementId: string) => {
    return highlightedElementId === elementId;
  };

  return (
    <div id="browser-simulator" className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xl flex flex-col h-[650px] relative">
      {/* 1. Chrome top-bar */}
      <div className="bg-slate-100 px-4 py-2 flex items-center gap-3 border-b border-slate-200 select-none">
        {/* Window controls */}
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-slate-300"></span>
          <span className="w-3 h-3 rounded-full bg-slate-300"></span>
          <span className="w-3 h-3 rounded-full bg-slate-300"></span>
        </div>

        {/* Browser Tabs with clean minimalist styling */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-medium ml-2 custom-scrollbar">
          <button
            id="tab-promail"
            onClick={() => !isSimulating && onSetPlatform('PROMAIL')}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition cursor-pointer shrink-0 ${
              activePlatform === 'PROMAIL'
                ? 'bg-white text-slate-900 shadow-xs border-t-2 border-slate-800 font-bold'
                : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>ProMail Admin</span>
          </button>
          <button
            id="tab-cloudvault"
            onClick={() => !isSimulating && onSetPlatform('CLOUD_VAULT')}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition cursor-pointer shrink-0 ${
              activePlatform === 'CLOUD_VAULT'
                ? 'bg-white text-slate-900 shadow-xs border-t-2 border-slate-800 font-bold'
                : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>CloudVault Storage</span>
          </button>
          <button
            id="tab-collabchat"
            onClick={() => !isSimulating && onSetPlatform('COLLAB_CHAT')}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition cursor-pointer shrink-0 ${
              activePlatform === 'COLLAB_CHAT'
                ? 'bg-white text-slate-900 shadow-xs border-t-2 border-slate-800 font-bold'
                : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>CollabChat Hub</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation controls & URL address bar */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
          <ArrowLeft className="w-4 h-4 cursor-not-allowed" />
          <ArrowRight className="w-4 h-4 cursor-not-allowed" />
          <RotateCw className="w-3.5 h-3.5 cursor-not-allowed" />
        </div>

        {/* URL Box */}
        <div className="flex-1 max-w-xl mx-auto bg-white border border-slate-200 rounded-lg py-1 px-3 flex items-center gap-2 text-xs text-slate-500 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-slate-300">https://</span>
          <input
            type="text"
            readOnly
            value={getUrl()}
            className="w-full bg-transparent border-none text-slate-600 outline-none text-[11px] font-mono"
          />
          <RotateCw className={`w-3 h-3 text-slate-300 ml-auto shrink-0 ${isSimulating ? 'animate-spin text-slate-600' : ''}`} />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono select-none overflow-hidden h-7">
          <AnimatePresence mode="wait">
            {isSimulating ? (
              <motion.span
                key="active"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 bg-slate-900 text-white rounded-full py-0.5 px-2.5 font-bold text-[10px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ROBOT RPA ACTIF ({simulationStep + 1}/{simulationSteps.length})
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="text-slate-500 flex items-center gap-1.5 font-semibold text-[10px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Prêt
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Simulated Canvas Area */}
      <div className="flex-1 bg-slate-50/50 overflow-auto p-6 relative select-none">
                {/* --- PORTAL 1: PROMAIL --- */}
        {activePlatform === 'PROMAIL' && (
          <motion.div
            key="PROMAIL"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <div className="bg-white rounded-lg h-full border border-slate-200/60 flex flex-col shadow-xs overflow-hidden">
              <header className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-xs uppercase tracking-wider">ProMail Admin Portal</span>
                </div>
                <span className="bg-slate-800 text-slate-300 text-[9px] font-bold py-0.5 px-2 rounded-full border border-slate-700">SANDBOX RPA ACTIVE</span>
              </header>

              <div className="flex-1 flex overflow-hidden">
                {/* ProMail Side Navigation */}
                <aside className="w-1/4 bg-slate-50/70 border-r border-slate-100 p-4 text-[11px] font-medium text-slate-500 space-y-3 shrink-0">
                  <div className="text-slate-400 uppercase text-[9px] font-bold tracking-wider mb-2">Utilisateurs</div>
                  <div className="text-slate-900 bg-slate-100 p-2 rounded-lg font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-700" /> Comptes actifs
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-100 cursor-not-allowed">Alias de domaine</div>
                  <div className="p-2 rounded-lg hover:bg-gray-100 cursor-not-allowed">Groupes de distribution</div>
                  <div className="p-2 rounded-lg hover:bg-gray-100 cursor-not-allowed mt-8">Paramètres de sécurité</div>
                </aside>

                {/* Main Content of ProMail */}
                <main className="flex-1 p-5 flex flex-col overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Gestion des Collaborateurs</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Total actifs : {promailUsers.length}</p>
                    </div>
                    {/* Visual trigger button representing what the RPA wants to click */}
                    <button
                      id="sim-promail-new-user-btn"
                      className={`text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                        isHighlighted('addButton') ? 'ring-4 ring-amber-400 scale-102 font-bold animate-pulse' : ''
                      }`}
                    >
                      + Nouveau Collaborateur
                    </button>
                  </div>

                  {/* Table list of Users */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden flex-1 mini-height">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px]">
                          <th className="p-2 pl-3">Nom & Prénom</th>
                          <th className="p-2">Adresse Mail</th>
                          <th className="p-2">Poste</th>
                          <th className="p-2">Statut</th>
                          <th className="p-2 text-right pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600">
                        {promailUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="p-2 pl-3 font-semibold text-slate-805">{user.firstname} {user.lastname}</td>
                            <td className="p-2 text-slate-700 font-mono text-[10px]">{user.email}</td>
                            <td className="p-2 text-slate-500">{user.role}</td>
                            <td className="p-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold">
                                ● {user.status}
                              </span>
                            </td>
                            <td className="p-2 text-right pr-3">
                              <button
                                id={`sim-delete-user-${user.email}`}
                                className={`p-1.5 text-rose-600 hover:bg-rose-50 rounded select-none cursor-pointer text-[10px] font-bold ${
                                  isHighlighted(`deleteBtn-${user.email}`) ? 'ring-4 ring-amber-400 scale-105' : ''
                                }`}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Simulated add modal when step 3 onwards for creation */}
                  <AnimatePresence>
                    {isSimulating &&
                      (isHighlighted('firstnameInput') || isHighlighted('lastnameInput') || isHighlighted('emailInput') || isHighlighted('submitButton')) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-40"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="bg-white rounded-xl border border-slate-200/80 max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4"
                          >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <Mail className="w-4 h-4 text-slate-600" />
                                Création d'adresse ProMail
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">AUTOMATE FIELD ENTRY</span>
                            </div>

                            <div className="space-y-3 text-[11px]">
                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Prénom</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={typedFirstname}
                                  placeholder="SAISIE RPA EN COURS..."
                                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 outline-none transition-all ${
                                    isHighlighted('firstnameInput') ? 'ring-2 ring-amber-400 bg-amber-50/30 border-amber-300' : 'bg-slate-50'
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Nom</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={typedLastname}
                                  placeholder="SAISIE RPA EN COURS..."
                                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 outline-none transition-all ${
                                    isHighlighted('lastnameInput') ? 'ring-2 ring-amber-400 bg-amber-50/30 border-amber-300' : 'bg-slate-50'
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Adresse Email</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={typedEmail}
                                  placeholder="SAISIE RPA EN COURS..."
                                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-800 outline-none transition-all ${
                                    isHighlighted('emailInput') ? 'ring-2 ring-amber-400 bg-amber-50/30 border-amber-300' : 'bg-slate-50'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 text-[10px]">
                              <button className="flex-1 bg-slate-100 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-200 font-bold text-slate-750">Annuler</button>
                              <button
                                id="sim-promail-submit-btn"
                                className={`flex flex-1 items-center justify-center bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-950 py-1.5 transition ${
                                  isHighlighted('submitButton') ? 'ring-4 ring-amber-400 animate-pulse scale-102' : ''
                                }`}
                              >
                                Enregistrer
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </main>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PORTAL 2: CLOUD_VAULT --- */}
        {activePlatform === 'CLOUD_VAULT' && (
          <motion.div
            key="CLOUD_VAULT"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <div className="bg-white rounded-lg h-full border border-slate-200/60 flex flex-col shadow-xs overflow-hidden">
              <header className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-xs uppercase tracking-wider">CloudVault Storage Portal</span>
                </div>
                <span className="bg-slate-800 text-slate-300 text-[9px] font-bold py-0.5 px-2 rounded-full border border-slate-700">SANDBOX RPA ACTIVE</span>
              </header>

              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar directory tree view */}
                <aside className="w-1/4 bg-slate-50/70 border-r border-slate-100 p-4 text-[11px] space-y-3 shrink-0 text-slate-600">
                  <div className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Hiérarchie FTP</div>
                  <div className="font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Root/
                  </div>
                  <div className="pl-4 py-1 flex items-center gap-1 text-slate-500">
                    📁 Shared/
                  </div>
                  <div className="pl-4 py-1 flex items-center gap-1 text-slate-500">
                    📁 Archives/
                  </div>
                  <div className="pl-4 py-1 flex items-center gap-1 text-slate-900 bg-slate-100 rounded-md font-semibold font-mono">
                    📁 partage-users/
                  </div>
                </aside>

                {/* Central directory actions view */}
                <main className="flex-1 p-5 flex flex-col overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Espaces Alloués aux Collaborateurs</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Total répertoires : {vaultFolders.length}</p>
                    </div>
                    <button
                      id="sim-vault-create-btn"
                      className={`text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                        isHighlighted('createUserFolderBtn') ? 'ring-4 ring-amber-400 select-none scale-102 font-bold animate-pulse' : ''
                      }`}
                    >
                      <FolderPlus className="w-3.5 h-3.5" /> Créer Espace
                    </button>
                  </div>

                  {/* Table of folder quotas */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden flex-1 mini-height">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px]">
                          <th className="p-2 pl-3">Nom Répertoire</th>
                          <th className="p-2">Propriétaire</th>
                          <th className="p-2">Quota Alloué</th>
                          <th className="p-2">Fichiers</th>
                          <th className="p-2 text-right pr-3">Révocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600">
                        {vaultFolders.map(folder => (
                          <tr key={folder.id} className="hover:bg-slate-50">
                            <td className="p-2 pl-3 font-mono font-semibold text-slate-800">/{folder.name}/</td>
                            <td className="p-2 text-slate-600 text-[10px] font-mono">{folder.owner}</td>
                            <td className="p-2 font-medium">{folder.quota}</td>
                            <td className="p-2 text-slate-400">{folder.filesCount} f.</td>
                            <td className="p-2 text-right pr-3">
                              <button
                                id={`sim-revoke-vault-${folder.owner}`}
                                className="text-amber-600 hover:bg-amber-50 rounded px-2 py-0.5 font-bold text-[10px]"
                              >
                                Déprovisonner
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Folder Creation Simulated Modal */}
                  <AnimatePresence>
                    {isSimulating &&
                      (isHighlighted('folderNameInput') || isHighlighted('confirmCreateBtn')) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-40"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="bg-white rounded-xl border border-slate-200/80 max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4"
                          >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <HardDrive className="w-4 h-4 text-slate-600" />
                                Créer répertoire de stockage
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">AUTOMATE FIELD ENTRY</span>
                            </div>

                            <div className="space-y-3 text-[11px]">
                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Nom du répertoire</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={typedFolderName}
                                  placeholder="SAISIE RPA EN COURS..."
                                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-850 outline-none transition-all ${
                                    isHighlighted('folderNameInput') ? 'ring-2 ring-amber-400 bg-amber-50/20 border-amber-300' : 'bg-slate-50'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Quota par défaut</label>
                                <select disabled value="25" className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-655 bg-slate-50">
                                  <option value="25">25 GB (Dossier sécurisé)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 text-[10px]">
                              <button className="flex-1 bg-slate-100 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-200 font-bold text-slate-700">Fermer</button>
                              <button
                                id="sim-vault-submit-btn"
                                className={`flex flex-1 items-center justify-center bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-950 py-1.5 transition ${
                                  isHighlighted('confirmCreateBtn') ? 'ring-4 ring-amber-400 animate-pulse scale-102' : ''
                                }`}
                              >
                                Valider et créer
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </main>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PORTAL 3: COLLAB_CHAT --- */}
        {activePlatform === 'COLLAB_CHAT' && (
          <motion.div
            key="COLLAB_CHAT"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <div className="bg-white rounded-lg h-full border border-slate-200/60 flex flex-col shadow-xs overflow-hidden">
              <header className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-xs uppercase tracking-wider">CollabChat Enterprise Hub</span>
                </div>
                <span className="bg-slate-800 text-slate-300 text-[9px] font-bold py-0.5 px-2 rounded-full border border-slate-700">SANDBOX RPA ACTIVE</span>
              </header>

              <div className="flex-1 flex overflow-hidden">
                {/* Slack-like Channels List with simple monochrome neutral colors */}
                <aside className="w-1/4 bg-slate-100 text-slate-750 p-4 text-[11px] space-y-4 shrink-0 border-r border-slate-200">
                  <div>
                    <h4 className="text-slate-400 font-bold tracking-wider text-[9px] uppercase">Canaux d'équipe</h4>
                    <ul className="space-y-1.5 mt-2">
                      <li className="text-slate-900 bg-slate-200/60 p-1.5 rounded cursor-pointer font-bold flex items-center gap-1"># général</li>
                      <li className="text-slate-500 px-1.5 hover:text-slate-900 cursor-pointer transition"># annonces</li>
                      <li className="text-slate-500 px-1.5 hover:text-slate-900 cursor-pointer transition"># rpa-tech</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-bold tracking-wider text-[9px] uppercase mt-2">Membres actifs</h4>
                    <ul className="space-y-1.5 mt-2 text-slate-500 font-medium">
                      <li className="flex items-center gap-1.5 px-1.5 font-semibold">🟢 Thomas Durand</li>
                      <li className="flex items-center gap-1.5 px-1.5">🟢 Martin Lucas</li>
                      <li className="flex items-center gap-1.5 px-1.5">⚪ Sophie Dubois</li>
                    </ul>
                  </div>
                </aside>

                {/* Members Admin of CollabChat */}
                <main className="flex-1 p-5 flex flex-col overflow-auto bg-slate-50/20">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Membres de l'Espace Chat</h3>
                      <p className="text-[10px] text-slate-400 font-medium font-sans">Administration et invitations</p>
                    </div>
                    <button
                      id="sim-chat-invite-btn"
                      className={`text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                        isHighlighted('inviteBtn') ? 'ring-4 ring-amber-400 scale-102 font-bold animate-pulse' : ''
                      }`}
                    >
                      Inviter un membre
                    </button>
                  </div>

                  {/* Membership Database list */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden flex-1 bg-white mini-height">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px]">
                          <th className="p-2 pl-3">Collaborateur</th>
                          <th className="p-2">Adresse Mail d'Invitation</th>
                          <th className="p-2">Présence</th>
                          <th className="p-2">Statut Workspace</th>
                          <th className="p-2 text-right pr-3">Désactivation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600">
                        {chatMembers.map(member => (
                          <tr key={member.id} className="hover:bg-slate-50">
                            <td className="p-2 pl-3 font-semibold text-slate-805">{member.fullname}</td>
                            <td className="p-2 text-slate-600 font-mono text-[10px]">{member.email}</td>
                            <td className="p-2">
                              <span className="flex items-center gap-1.5 font-medium text-slate-605 text-[10px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${member.presence === 'online' ? 'bg-emerald-500' : 'bg-slate-350'}`}></span>
                                {member.presence === 'online' ? 'En ligne' : 'Inactif'}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-bold">{member.status}</span>
                            </td>
                            <td className="p-2 text-right pr-3">
                              <button
                                id={`sim-disable-chat-${member.email}`}
                                className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-[10px] font-bold"
                              >
                                Désactiver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Invitation Modal */}
                  <AnimatePresence>
                    {isSimulating &&
                      (isHighlighted('emailField') || isHighlighted('submitInvite')) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-40"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="bg-white rounded-xl border border-slate-200/80 max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4"
                          >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <MessageSquare className="w-4 h-4 text-slate-600" />
                                Inviter sur l'Espace Chat
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">AUTOMATE FIELD ENTRY</span>
                            </div>

                            <div className="space-y-3 text-[11px]">
                              <div>
                                <label className="text-slate-500 block mb-1 font-bold uppercase text-[9px]">Adresse email d'invitation</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={typedInviteEmail}
                                  placeholder="SAISIE RPA EN COURS..."
                                  className={`w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-850 outline-none transition-all ${
                                    isHighlighted('emailField') ? 'ring-2 ring-amber-400 bg-amber-50/20 border-amber-300' : 'bg-slate-50'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 text-[10px]">
                              <button className="flex-1 bg-slate-100 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-200 font-bold text-slate-700">Fermer</button>
                              <button
                                id="sim-chat-submit-btn"
                                className={`flex flex-1 items-center justify-center bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-950 py-1.5 transition ${
                                  isHighlighted('submitInvite') ? 'ring-4 ring-amber-400 animate-pulse scale-102' : ''
                                }`}
                              >
                                Envoyer
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </main>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- FLOATING KEYCAPS --- */}
        <AnimatePresence>
          {floatingKeys.map(k => (
            <motion.div
              key={k.id}
              initial={{ opacity: 1, scale: 0.6, y: -8, rotate: 0 }}
              animate={{ 
                opacity: 0, 
                scale: 1.2, 
                y: -95, 
                x: (Math.random() - 0.5) * 45, // realistic physical drift
                rotate: (Math.random() - 0.5) * 40 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: "easeOut" }}
              className="absolute bg-amber-400 text-slate-900 border border-amber-300 rounded-md font-mono px-2 py-0.5 text-xs font-black shadow-md z-50 pointer-events-none"
              style={{
                left: `${k.x}%`,
                top: `${k.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {k.char === ' ' ? '␣' : k.char.toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* --- 4. RPA ROBOT MOUSE FLOATING OVERLAY --- */}
        {isSimulating && (
          <div
            id="rpa-laser-cursor"
            className="absolute z-50 pointer-events-none transition-all duration-700 ease-out flex flex-col items-center justify-start select-none"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Glowing Laser Pointer represent the robot coordinate trigger */}
            <div className="relative">
              {/* Autotarget Bracket Overlay scanner */}
              {(cursorState === 'typing' || cursorState === 'clicking') && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -left-12 -top-12 w-24 h-24 border border-dashed border-amber-400/40 rounded-lg flex items-center justify-center animate-pulse"
                >
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500"></div>
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500"></div>
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500"></div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500"></div>
                  <div className="w-full h-0.5 bg-amber-400/30 absolute animate-bounce"></div>
                </motion.div>
              )}

              {/* Spinning outer status ring */}
              <div className={`w-10 h-10 border-2 rounded-full absolute -left-5 -top-5 animate-spin ${
                cursorState === 'clicking' ? 'border-red-500 scale-50' : 
                cursorState === 'typing' ? 'border-amber-400 scale-90' : 'border-indigo-400 scale-75'
              }`}></div>
              
              {/* Outer halo */}
              <div className={`w-8 h-8 rounded-full opacity-30 absolute -left-4 -top-4 animate-ping ${
                cursorState === 'clicking' ? 'bg-red-500' :
                cursorState === 'typing' ? 'bg-amber-400' : 'bg-indigo-500'
              }`}></div>
              
              {/* Core visual point */}
              <div className={`w-3 h-3 rounded-full border border-white shadow-md ${
                cursorState === 'clicking' ? 'bg-red-600 scale-125' :
                cursorState === 'typing' ? 'bg-amber-500 scale-105' : 'bg-indigo-600'
              }`}></div>

              {/* Laser Line tracing to current active component */}
              <span className="absolute left-4 top-2 bg-indigo-900 border border-indigo-700 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                {cursorState === 'moving' && '🤖 MOBILITÉ RPA'}
                {cursorState === 'clicking' && '⚡ TRANSACTION CLIC'}
                {cursorState === 'typing' && '⌨ SAISIE CLAVIER'}
                {cursorState === 'idle' && '🤖 ATTENTE ACTEUR'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- 4b. RPA TELEMETRY HUD & MECHANICAL KEYBOARD MATRIX --- */}
      {(() => {
        const keysRow1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
        const keysRow2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '@'];
        const keysRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '-', '_'];
        const currentPressedKey = currentInputText.value ? currentInputText.value.slice(-1).toUpperCase() : '';
        const isSpacePressed = currentInputText.value ? currentInputText.value.slice(-1) === ' ' : false;

        return (
          <div className="bg-slate-900 border-t border-slate-800 text-slate-200 p-3 flex flex-col md:flex-row gap-3 justify-between items-stretch shrink-0 font-sans select-none">
            {/* Panel 1: Telemetry Diagnostics */}
            <div className="flex-1 min-w-[190px] flex flex-col justify-between text-xs space-y-1.5 border-r border-slate-800/80 pr-3">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold tracking-wider text-[9px] uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Télémétrie RPA de Saisie</span>
              </div>
              <div className="space-y-1 font-mono text-[9px] text-slate-400">
                <div className="flex justify-between">
                  <span>Sélecteur DOM:</span>
                  <span className="text-amber-400 font-bold">{highlightedElementId ? `#${highlightedElementId}` : 'Aucun'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opération:</span>
                  <span className="text-white font-semibold">
                    {cursorState === 'moving' && 'Calcul trajectoire'}
                    {cursorState === 'clicking' && 'Clic physique (DOM_Click)'}
                    {cursorState === 'typing' && 'Saisie Keystroke hardware'}
                    {cursorState === 'idle' && 'Processus En Attente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pilote Clavier:</span>
                  <span className={cursorState === 'typing' ? 'text-emerald-400 font-semibold' : ''}>
                    {cursorState === 'typing' ? 'ACTIF (Virtual_HID)' : 'INACTIF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Matching sélecteur:</span>
                  <span className="text-emerald-500 font-semibold">100% stable</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Mechanical Keyboard Matrix View */}
            <div className="flex-[1.5] flex flex-col items-center justify-center space-y-1 px-1">
              <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase self-start mb-0.5">
                Matrice d'activation des touches
              </div>
              <div className="flex flex-col gap-0.5 items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50">
                {/* Row 1 */}
                <div className="flex gap-0.5">
                  {keysRow1.map(key => {
                    const isActive = cursorState === 'typing' && currentPressedKey === key;
                    return (
                      <motion.span
                        key={key}
                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                        className={`w-5 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-all duration-75 ${
                          isActive 
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)] font-black' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {key}
                      </motion.span>
                    );
                  })}
                </div>
                {/* Row 2 */}
                <div className="flex gap-0.5">
                  {keysRow2.map(key => {
                    const isActive = cursorState === 'typing' && currentPressedKey === key;
                    return (
                      <motion.span
                        key={key}
                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                        className={`w-5 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-all duration-75 ${
                          isActive 
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)] font-black' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {key}
                      </motion.span>
                    );
                  })}
                </div>
                {/* Row 3 */}
                <div className="flex gap-0.5">
                  {keysRow3.map(key => {
                    const isActive = cursorState === 'typing' && currentPressedKey === key;
                    return (
                      <motion.span
                        key={key}
                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                        className={`w-5 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-all duration-75 ${
                          isActive 
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)] font-black' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {key}
                      </motion.span>
                    );
                  })}
                </div>
                {/* Spacebar Row */}
                <div className="flex gap-0.5 w-full justify-center">
                  <motion.span
                    animate={isSpacePressed && cursorState === 'typing' ? { scale: 1.05 } : { scale: 1 }}
                    className={`h-3 w-28 rounded text-[8px] font-mono font-bold flex items-center justify-center border transition-all duration-75 uppercase tracking-wide ${
                      isSpacePressed && cursorState === 'typing'
                        ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-600'
                    }`}
                  >
                    Espace
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Panel 3: Typing Ribbon track */}
            <div className="flex-1 min-w-[190px] flex flex-col justify-between border-l border-slate-800/80 pl-3 h-full">
              <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                Ruban de saisie en direct
              </div>
              <div className="bg-slate-950/85 p-1.5 rounded-lg border border-slate-800/60 font-mono text-[10px] min-h-[36px] flex items-center overflow-x-auto whitespace-nowrap max-w-[210px] text-amber-500 font-bold tracking-widest leading-none">
                {currentInputText.value ? (
                  <span className="flex items-center gap-0.5 animate-pulse">
                    {currentInputText.value.split('').map((char, index) => (
                      <span key={index} className="bg-amber-950/40 border border-amber-800/40 text-amber-400 px-0.5 rounded">
                        {char === ' ' ? '␣' : char}
                      </span>
                    ))}
                    <span className="w-1.5 h-3 bg-amber-400 animate-bounce"></span>
                  </span>
                ) : (
                  <span className="text-slate-600 text-[9px] uppercase italic tracking-wide">
                    Aucune saisie détectée
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. Mock Browser footer status */}
      <footer className="bg-gray-100 px-4 py-2 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between select-none">
        <span>Environnement bac à sable : Enterprise Secure Internal Network</span>
        <span className="font-mono text-gray-400">Engine status: ACTIVE</span>
      </footer>
    </div>
  );
}

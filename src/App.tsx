/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, AlertTriangle, CheckCircle, RefreshCw, Layers, Terminal as TermIcon, FileCode, Users, Trash2, ArrowRight, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnimatePresence, motion } from 'motion/react';
import { Collaborator, RpaLog, RpaPlatform, SimulationStep } from './types';
import RpaTerminal from './components/RpaTerminal';
import BrowserSimulator from './components/BrowserSimulator';
import AcademicThesis from './components/AcademicThesis';
import DashboardStats from './components/DashboardStats';
import EventJournal from './components/EventJournal';

export default function App() {
  // --- STATE ---
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      firstname: 'Martin',
      lastname: 'Lucas',
      email: 'm.lucas@entreprise-rpa.com',
      role: 'Support Client',
      department: 'Relations Client',
      status: 'active',
      platforms: { email: true, storage: true, chat: true },
      created_at: '2026-06-11 14:30'
    },
    {
      id: '2',
      firstname: 'Sophie',
      lastname: 'Dubois',
      email: 's.dubois@entreprise-rpa.com',
      role: 'Product Owner',
      department: 'Produit',
      status: 'active',
      platforms: { email: true, storage: true, chat: false },
      created_at: '2026-06-12 09:12'
    }
  ]);

  const [logs, setLogs] = useState<RpaLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Initialisation du module RPA Gateway...'
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: 'Passerelle interne active sur https://saas-gateway.internal (Mode simulation synchronisé)'
    }
  ]);

  // Visual simulation states
  const [activePlatform, setActivePlatform] = useState<RpaPlatform>('PROMAIL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [currentInputText, setCurrentInputText] = useState<{ field: string; value: string }>({ field: '', value: '' });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [cursorState, setCursorState] = useState<'idle' | 'moving' | 'typing' | 'clicking'>('idle');
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);

  // Rollback and simulation tracking
  const [currentOnboardingData, setCurrentOnboardingData] = useState<{ firstname: string; lastname: string; email: string; role: string; department: string } | null>(null);
  const activeTimeoutRef = useRef<any>(null);
  const activeIntervalRef = useRef<any>(null);
  const isCanceledRef = useRef<boolean>(false);

  // Network simulation states (latency detection)
  const [networkLatencyMode, setNetworkLatencyMode] = useState(false);
  const [slowNetworkWarning, setSlowNetworkWarning] = useState(false);
  const [currentStepDuration, setCurrentStepDuration] = useState(0);

  // Form input states
  const [formFirstname, setFormFirstname] = useState('Thomas');
  const [formLastname, setFormLastname] = useState('Durand');
  const [formEmail, setFormEmail] = useState('t.durand@entreprise-rpa.com');
  const [formRole, setFormRole] = useState('Ingénieur Systèmes');
  const [formDept, setFormDept] = useState('R&D');

  // Sync inputs if user changes names
  useEffect(() => {
    const formattedEmail = `${formFirstname.toLowerCase()}.${formLastname.toLowerCase()}@entreprise-rpa.com`;
    setFormEmail(formattedEmail);
  }, [formFirstname, formLastname]);

  const addLog = (log: RpaLog) => {
    setLogs(prev => [...prev, log]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 15;

      // Header Banner
      doc.setFillColor(26, 32, 44);
      doc.rect(15, y, 180, 28, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("RAPPORT D'AUDIT & PREUVE DE RECONCILIATION RPA", 21, y + 10);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(200, 203, 217);
      doc.text("Theme 4 : Gestion automatique et securisee du cycle de vie des acces (Onboarding/Offboarding)", 21, y + 17);
      doc.text("Delivre comme preuve documentaire de soutenance academique", 21, y + 23);

      y += 35;

      // Metadata section
      doc.setFillColor(243, 244, 246);
      doc.rect(15, y, 180, 28, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.text("METADONNEES DE SUSTENTATION :", 20, y + 7);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Genere le : ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 20, y + 14);
      doc.text("Candidat : wantougarrix@gmail.com | Option : Automatisation & RPA", 20, y + 21);

      y += 35;

      // Collaborators Table Section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 32, 44);
      doc.text("I. REGISTRE ET STATUT DES COMPTES COLLABORATEURS", 15, y);
      y += 6;

      // Table Header
      doc.setFillColor(79, 70, 229); // Accent indigo
      doc.rect(15, y, 180, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text("Collaborateur", 18, y + 5);
      doc.text("Adresse Email", 60, y + 5);
      doc.text("Role", 115, y + 5);
      doc.text("Statut", 160, y + 5);
      y += 7;

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      collaborators.forEach((c) => {
        // Row background
        doc.setFillColor(255, 255, 255);
        doc.rect(15, y, 180, 8, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.line(15, y + 8, 195, y + 8);

        doc.setFontSize(8);
        doc.text(`${c.firstname} ${c.lastname}`, 18, y + 5);
        doc.text(c.email, 60, y + 5);
        doc.text(c.role, 115, y + 5);
        
        if (c.status === 'active') {
          doc.setTextColor(16, 185, 129);
          doc.text("ACTIF (3/3 SaaS)", 160, y + 5);
        } else {
          doc.setTextColor(239, 68, 68);
          doc.text("REVOKE", 160, y + 5);
        }
        doc.setTextColor(55, 65, 81);
        y += 8;
      });

      y += 10;

      // RPA Logs title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 32, 44);
      doc.text("II. JOURNAL D'ORCHESTRATION ET COMPTES RENDUS DE TRANSACTION RPA", 15, y);
      y += 6;

      // Render Logs inside a monospace styled looking output
      doc.setFillColor(18, 22, 32); // Terminal background color
      doc.rect(15, y, 180, 70, 'F');
      
      doc.setFont('Courier', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(110, 231, 183); // Light emerald green
      
      let logY = y + 5;
      const visibleLogs = logs.slice(-14); // Show last 14 logs in console area (fits in A4)
      visibleLogs.forEach((log) => {
        // Remove non-standard ascii characters to prevent encoding problems in default jsPDF fonts
        let cleanMsg = log.message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        // also replace any non-ascii ones
        cleanMsg = cleanMsg.replace(/[^\x00-\x7F]/g, "");
        const line = `[${log.timestamp}] ${log.type.toUpperCase()}: ${cleanMsg.substring(0, 80)}`;
        doc.text(line, 18, logY);
        logY += 4.5;
      });

      y += 80;

      // Thesis context callout
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 32, 44);
      doc.text("III. ALIGNEMENT ACADEMIQUE DE LA CONCEPTION", 15, y);
      y += 6;

      doc.setFillColor(249, 250, 251);
      doc.rect(15, y, 180, 24, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99);
      
      const p1 = "Deduction relative au probleme academique du memoire: L'orchestration RPA en cascade d'ancrage";
      const p2 = "surmonte l'absence d'API en interceptant dynamiquement le DOM. L'usage d'Expected Conditions";
      const p3 = "asynchrones preserve l'integrite de la transaction multi-plateforme en cas de latence fluctuante.";
      
      doc.text(p1, 18, y + 6);
      doc.text(p2, 18, y + 12);
      doc.text(p3, 18, y + 18);
      
      y += 32;

      // Jury Sign-off block
      doc.setDrawColor(209, 213, 219);
      doc.line(15, y, 195, y);
      y += 8;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(55, 65, 81);
      doc.text("VISA DU CANDIDAT (wantougarrix@gmail.com)", 15, y);
      doc.text("SIGNATURE DU PRESIDENT DE JURY RPA", 115, y);

      y += 10;
      doc.setDrawColor(209, 213, 219);
      doc.rect(15, y, 60, 15, 'S');
      doc.rect(115, y, 65, 15, 'S');

      doc.save("PREUVE_DOCUMENTAIRE_MEMOIRE_RPA.pdf");
      
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: '📄 [DOCS] Exportation PDF de preuve documentaire reussie ! Fichier : PREUVE_DOCUMENTAIRE_MEMOIRE_RPA.pdf'
      });
    } catch (err: any) {
      console.error("Failed to export PDF", err);
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'Echec de la generation du PDF: ' + err.message
      });
    }
  };

  // --- CORE SIMULATION ENGINE ORCHESTRATION ---
  const runSimulationSeq = (steps: SimulationStep[], onComplete: () => void) => {
    if (steps.length === 0) return;
    setIsSimulating(true);
    setSimulationSteps(steps);
    setSimulationStepIndex(0);

    let currentStep = 0;

    const executeNextStep = () => {
      if (currentStep >= steps.length) {
        setIsSimulating(false);
        setCursorState('idle');
        setHighlightedElementId(null);
        setCurrentInputText({ field: '', value: '' });
        setSlowNetworkWarning(false);
        onComplete();
        return;
      }

      setSimulationStepIndex(currentStep);
      const step = steps[currentStep];

      // Calculate latency-adjusted duration
      const computedDuration = step.duration + (networkLatencyMode ? 2500 : 0);
      setCurrentStepDuration(computedDuration);

      // Detect latency and trigger "Réseau lent" warnings
      if (computedDuration > 3000) {
        setSlowNetworkWarning(true);
        addLog({
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: `⚠️ [RÉSEAU LENT] Latence détectée (${(computedDuration / 1000).toFixed(1)}s) sur ${step.platform}. Optimisation adaptative DOM active.`
        });
      } else {
        setSlowNetworkWarning(false);
      }

      // 1. Log simulation progress step
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: step.action === 'success' ? 'success' : 'info',
        message: step.logMessage,
        platform: step.platform
      });

      // 2. Switch platform window if different
      setActivePlatform(step.platform);

      // 3. Coordinate cursor translation
      let targetX = 50;
      let targetY = 50;
      let newState: 'idle' | 'moving' | 'typing' | 'clicking' = 'moving';

      if (step.action === 'navigate') {
        targetX = 50;
        targetY = 25;
        newState = 'moving';
      } else if (step.targetId === 'addButton') {
        targetX = 85;
        targetY = 22;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'deleteBtn-t.durand@entreprise-rpa.com') {
        targetX = 94; // right action column delete
        targetY = 50;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'firstnameInput') {
        targetX = 45;
        targetY = 32;
        newState = step.action === 'type' ? 'typing' : 'moving';
      } else if (step.targetId === 'lastnameInput') {
        targetX = 45;
        targetY = 44;
        newState = step.action === 'type' ? 'typing' : 'moving';
      } else if (step.targetId === 'emailInput') {
        targetX = 45;
        targetY = 56;
        newState = step.action === 'type' ? 'typing' : 'moving';
      } else if (step.targetId === 'submitButton') {
        targetX = 64;
        targetY = 72;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'createUserFolderBtn') {
        targetX = 85;
        targetY = 20;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'folderNameInput') {
        targetX = 45;
        targetY = 38;
        newState = step.action === 'type' ? 'typing' : 'moving';
      } else if (step.targetId === 'confirmCreateBtn') {
        targetX = 60;
        targetY = 65;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'inviteBtn') {
        targetX = 88;
        targetY = 20;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      } else if (step.targetId === 'emailField') {
        targetX = 45;
        targetY = 42;
        newState = step.action === 'type' ? 'typing' : 'moving';
      } else if (step.targetId === 'submitInvite') {
        targetX = 60;
        targetY = 60;
        newState = step.action === 'click' ? 'clicking' : 'moving';
      }

      setCursorPos({ x: targetX, y: targetY });
      setCursorState(newState);
      setHighlightedElementId(step.targetId || null);

      // Simple visual text typewriter
      if (step.action === 'type' && step.value) {
        let textVal = step.value;
        const inputField = step.targetId === 'firstnameInput' ? 'firstname' :
                           step.targetId === 'lastnameInput' ? 'lastname' :
                           step.targetId === 'emailInput' ? 'email' :
                           step.targetId === 'folderNameInput' ? 'foldername' :
                           step.targetId === 'emailField' ? 'inviteEmail' : '';
        
        let typedPart = '';
        let letterIdx = 0;
        const typeInterval = setInterval(() => {
          if (letterIdx < textVal.length) {
            typedPart += textVal[letterIdx];
            setCurrentInputText({ field: inputField, value: typedPart });
            letterIdx++;
          } else {
            clearInterval(typeInterval);
          }
        }, Math.max(10, Math.floor(computedDuration / textVal.length / 1.5)));
        activeIntervalRef.current = typeInterval;
      } else {
        setCurrentInputText({ field: '', value: '' });
      }

      // Schedule next step execution with latency-adjusted duration
      const timeoutId = setTimeout(() => {
        currentStep++;
        executeNextStep();
      }, computedDuration);
      activeTimeoutRef.current = timeoutId;
    };

    executeNextStep();
  };

  // Trigger Onboarding Execution Flow
  const launchOnboarding = (firstname: string, lastname: string, email: string, role: string, department: string) => {
    if (isSimulating) return;

    setCurrentOnboardingData({ firstname, lastname, email, role, department });

    // Build the dynamic execution recipe for onboarding
    const steps: SimulationStep[] = [
      {
        platform: 'PROMAIL',
        action: 'navigate',
        logMessage: '🤖 [RPA] Navigation vers la console d\'administration ProMail (SaaS #1)...',
        duration: 1200
      },
      {
        platform: 'PROMAIL',
        action: 'focus',
        targetId: 'addButton',
        logMessage: '🤖 [RPA] Recherche du composant sémantique stable [ + Nouveau Collaborateur ]...',
        duration: 1000
      },
      {
        platform: 'PROMAIL',
        action: 'click',
        targetId: 'addButton',
        logMessage: '⚡ [RPA] Action : Clic sur bouton d\'ajout de collaborateur.',
        duration: 800
      },
      {
        platform: 'PROMAIL',
        action: 'type',
        targetId: 'firstnameInput',
        value: firstname,
        logMessage: `⌨ [RPA] Saisie sécurisée : Prénom -> "${firstname}" (Délai d'action humaine simulé)`,
        duration: 1400
      },
      {
        platform: 'PROMAIL',
        action: 'type',
        targetId: 'lastnameInput',
        value: lastname,
        logMessage: `⌨ [RPA] Saisie sécurisée : Nom -> "${lastname}"`,
        duration: 1200
      },
      {
        platform: 'PROMAIL',
        action: 'type',
        targetId: 'emailInput',
        value: email,
        logMessage: `⌨ [RPA] Saisie sécurisée : Adresse mail -> "${email}"`,
        duration: 1600
      },
      {
        platform: 'PROMAIL',
        action: 'click',
        targetId: 'submitButton',
        logMessage: '⚡ [RPA] Envoi de la requête de création de boîte de messagerie...',
        duration: 3200
      },
      {
        platform: 'PROMAIL',
        action: 'success',
        logMessage: '✔ [SUCCESS] Boîte mail d’entreprise créée ! Synchronisation du DOM validée.',
        duration: 1200
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'navigate',
        logMessage: '🤖 [RPA] Navigation vers le portail CloudVault Storage (SaaS #2)...',
        duration: 1300
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'focus',
        targetId: 'createUserFolderBtn',
        logMessage: '🤖 [RPA] Recherche du point d\'ancrage résilient [ Créer Espace ]...',
        duration: 900
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'click',
        targetId: 'createUserFolderBtn',
        logMessage: '⚡ [RPA] Sélection du déclencheur d\'espace disque.',
        duration: 800
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'type',
        targetId: 'folderNameInput',
        value: `partage-${lastname.toLowerCase()}`,
        logMessage: `⌨ [RPA] Calcul et saisie du répertoire rattaché : "/partage-${lastname.toLowerCase()}/"`,
        duration: 1300
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'click',
        targetId: 'confirmCreateBtn',
        logMessage: '⚡ [RPA] Validation de l\'attribution du quota disque de 25 GB par défaut...',
        duration: 1400
      },
      {
        platform: 'CLOUD_VAULT',
        action: 'success',
        logMessage: '✔ [SUCCESS] Répertoire de stockage cloud provisionné avec succès.',
        duration: 1205
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'navigate',
        logMessage: '🤖 [RPA] Navigation vers la console d\'invitations CollabChat (SaaS #3)...',
        duration: 1300
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'focus',
        targetId: 'inviteBtn',
        logMessage: '🤖 [RPA] Recherche de l\'élément de dialogue par classe descendante...',
        duration: 800
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'click',
        targetId: 'inviteBtn',
        logMessage: '⚡ [RPA] Clic sur invitation par adresse de messagerie.',
        duration: 700
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'type',
        targetId: 'emailField',
        value: email,
        logMessage: `⌨ [RPA] Saisie de la cible : "${email}"`,
        duration: 1600
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'click',
        targetId: 'submitInvite',
        logMessage: '⚡ [RPA] Envoi de l\'invitation au groupe R&D...',
        duration: 1500
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'success',
        logMessage: '✔ [SUCCESS] Invitation intégrée au Salon principal. Transactions hétérogènes terminées.',
        duration: 1000
      }
    ];

    runSimulationSeq(steps, () => {
      setCurrentOnboardingData(null);
      // Complete Onboard callback: Append new collaborator to state
      const isRegistered = collaborators.some(c => c.email === email);
      if (!isRegistered) {
        setCollaborators(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            firstname,
            lastname,
            email,
            role,
            department,
            status: 'active',
            platforms: { email: true, storage: true, chat: true },
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        ]);
        addLog({
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `📊 [ORCHESTRE] Collaborateur ${firstname} ${lastname} enregistré dans le registre d'accès.`
        });
      }
    });
  };

  // Trigger Offboarding Execution Flow
  const launchOffboarding = (email: string) => {
    if (isSimulating) return;

    const targetUser = collaborators.find(c => c.email === email);
    const fname = targetUser ? targetUser.firstname : 'Thomas';
    const lname = targetUser ? targetUser.lastname : 'Durand';

    const steps: SimulationStep[] = [
      {
        platform: 'PROMAIL',
        action: 'navigate',
        logMessage: `🤖 [RPA-REVOCATION] Connexion à ProMail Admin pour résilier l'accès : ${email}...`,
        duration: 1400
      },
      {
        platform: 'PROMAIL',
        action: 'focus',
        targetId: `deleteBtn-${email}`,
        logMessage: `🤖 [RPA] Recherche du conteneur de profil associé à ${email}...`,
        duration: 1000
      },
      {
        platform: 'PROMAIL',
        action: 'click',
        targetId: `deleteBtn-${email}`,
        logMessage: `⚡ [RPA] Clic sur révocation. Traitement asynchrone des alertes de confirmation...`,
        duration: 3150
      },
      {
        platform: 'PROMAIL',
        action: 'success',
        logMessage: '✔ [SUCCESS] Compte de messagerie ProMail suspendu.',
        duration: 1100
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'navigate',
        logMessage: '🤖 [RPA-REVOCATION] Connexion au Hub CollabChat pour fermeture de session...',
        duration: 1200
      },
      {
        platform: 'COLLAB_CHAT',
        action: 'success',
        logMessage: '✔ [SUCCESS] jeton de session révoqué et compte chat désactivé.',
        duration: 1000
      }
    ];

    runSimulationSeq(steps, () => {
      // Update collaborator db state
      setCollaborators(prev =>
        prev.map(c => (c.email === email ? { ...c, status: 'inactive' } : c))
      );
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `📊 [ORCHESTRE] Clôture des accès terminée de manière saine pour ${fname} ${lname}.`
      });
    });
  };

  const handleUndoLastAction = () => {
    // 1. Interruption of the current timers
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }

    setIsSimulating(false);
    setCursorState('idle');
    setHighlightedElementId(null);
    setCurrentInputText({ field: '', value: '' });
    setSlowNetworkWarning(false);

    // Save the candidate properties before resetting states
    const candidate = currentOnboardingData;
    setCurrentOnboardingData(null);

    if (!candidate) {
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'warning',
        message: `⚠️ Aucun processus d'Onboarding en cours d'exécution à annuler.`
      });
      return;
    }

    const { firstname, lastname, email } = candidate;

    // Check if the ProMail account had already been created (occurs at step 7 or later)
    if (simulationStepIndex < 7) {
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'warning',
        message: `rpa-operator@saas-gateway:~$ rpa-undo --force`
      });
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'warning',
        message: `⚠️ [OPERATOR] Annulation de la saisie avant génération d'adresse mail.`
      });
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: `🤖 [ROLLBACK] Nettoyage : Aucun compte de messagerie externe n'avait été validé pour "${firstname} ${lastname}".`
      });
      addLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `✔ [ROLLBACK] Réinitialisation du système réussie à 100%. Saisie interrompue proprement.`
      });
      return;
    }

    // ProMail account WAS created (and potentially CloudVault as well).
    // We execute a real, visual Compensatory Rollback!
    addLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning',
      message: `rpa-operator@saas-gateway:~$ rpa-undo --compensate`
    });
    addLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'error',
      message: `⚠️ [DÉFAUT RATTRAPÉ] Frappe erronée ou fausse manipulation signalée pour ${email} !`
    });
    addLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: `🤖 [ORCHESTRE] Lancement transactionnel renforcé du protocole de Rollback Compensatoire.`
    });

    const isStorageCreatedTemp = simulationStepIndex >= 13;

    // Compile compensatory rollback automation step-by-step
    const rollbackSteps: SimulationStep[] = [];

    // If backup storage was created, clean it up
    if (isStorageCreatedTemp) {
      rollbackSteps.push(
        {
          platform: 'CLOUD_VAULT',
          action: 'navigate',
          logMessage: `🤖 [ROLLBACK] Redirection vers le gestionnaire CloudVault...`,
          duration: 1100
        },
        {
          platform: 'CLOUD_VAULT',
          action: 'focus',
          targetId: `confirmCreateBtn`,
          logMessage: `🤖 [ROLLBACK] Suppression du répertoire résuri /partage-${lastname.toLowerCase()}/...`,
          duration: 900
        },
        {
          platform: 'CLOUD_VAULT',
          action: 'success',
          logMessage: `✔ [ROLLBACK] Répartition de quota résiliée et fichiers CloudVault purgés de manière intègre.`,
          duration: 900
        }
      );
    }

    // Clean up ProMail mailbox
    rollbackSteps.push(
      {
        platform: 'PROMAIL',
        action: 'navigate',
        logMessage: `🤖 [ROLLBACK] Redirection du robot vers la console d'administration ProMail...`,
        duration: 1100
      },
      {
        platform: 'PROMAIL',
        action: 'focus',
        targetId: `deleteBtn-${email}`,
        logMessage: `🤖 [ROLLBACK] Ciblage de l'adresse mail créée par erreur : ${email}...`,
        duration: 900
      },
      {
        platform: 'PROMAIL',
        action: 'click',
        targetId: `deleteBtn-${email}`,
        logMessage: `⚡ [ROLLBACK] Action : Suppression définitive de la boîte aux lettres ProMail de ${firstname} ${lastname}.`,
        duration: 1000
      },
      {
        platform: 'PROMAIL',
        action: 'success',
        logMessage: `✔ [ROLLBACK] Compte mail supprimé sur ProMail. Zéro dérive de configuration.`,
        duration: 1000
      }
    );

    // Run this animated rollback compensation sequence inside the browser simulator!
    setTimeout(() => {
      runSimulationSeq(rollbackSteps, () => {
        addLog({
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `📊 [ORCHESTRE] Rollback compensatoire transactionnel achevé de bout en bout ! Prêt pour une nouvelle saisie.`
        });
      });
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstname || !formLastname || !formEmail) return;
    launchOnboarding(formFirstname, formLastname, formEmail, formRole, formDept);
  };

  const handleQuickOnboardDemo = () => {
    launchOnboarding('Thomas', 'Durand', 't.durand@entreprise-rpa.com', 'Ingénieur Systèmes', 'R&D');
  };

  const handleQuickOffboardDemo = () => {
    launchOffboarding('t.durand@entreprise-rpa.com');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col justify-between relative">
      {/* Slow network adaptive safety alert banner */}
      <AnimatePresence>
        {slowNetworkWarning && (
          <motion.div
            id="slow-network-banner"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-11/12 max-w-lg bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 select-none"
          >
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-800">RÉSEAU LENT DÉTECTÉ</span>
                <span className="bg-amber-100 text-amber-900 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse border border-amber-300">
                  Attente Adaptative
                </span>
              </div>
              <p className="text-[10px] text-amber-700 leading-snug">
                Le serveur SaaS actuel répond lentement ({currentStepDuration}ms). La robustesse RPA est engagée avec des sélecteurs <strong className="font-bold">Expected Conditions</strong> auto-régulés pour parer aux défaillances.
              </p>
            </div>
            <span className="text-[9px] bg-amber-100 text-amber-850 px-1.5 py-1 rounded font-mono font-bold shrink-0 self-center">
              TÉLÉMÉTRIE ACTIVE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header with academic specifications */}
      <header className="bg-slate-950 text-white px-6 py-5 shadow-sm border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-base font-extrabold tracking-tight md:text-lg text-slate-100">
                Système d'Intégration d'Accès RPA — Onboarding & Offboarding
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
              Automatisation robotisée (RPA) du provisionnement et de la fermeture de comptes sur plateformes de travail hétérogènes SaaS sans API natives.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 shrink-0">
            <div className="p-1 px-1.5 bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/35">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left text-[10px] space-y-0.5">
              <div className="font-bold text-slate-200">Mémoire de Spécialité Académique</div>
              <div className="text-indigo-300 font-medium">Validation Isolée par le Jury RPA</div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main content dashboard space */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* --- LEFT PANEL: CONTROLS & TERMINAL (lg:col-span-5) --- */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Quick interactive controller panel */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Console de Provisionnement Rapide
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Démonstration en 1 Clic</span>
            </div>

            {/* Simulated fast controls form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Prénom</label>
                  <input
                    id="input-form-first"
                    type="text"
                    required
                    disabled={isSimulating}
                    value={formFirstname}
                    onChange={(e) => setFormFirstname(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-850 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Nom</label>
                  <input
                    id="input-form-last"
                    type="text"
                    required
                    disabled={isSimulating}
                    value={formLastname}
                    onChange={(e) => setFormLastname(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-850 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Rôle / Poste</label>
                  <input
                    id="input-form-role"
                    type="text"
                    required
                    disabled={isSimulating}
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-850 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Département</label>
                  <input
                    id="input-form-dept"
                    type="text"
                    required
                    disabled={isSimulating}
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-850 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Adresse email générée (RPA Target)</label>
                <div className="font-mono text-[10px] bg-slate-950 text-emerald-400 p-2.5 rounded-lg border border-slate-800 font-semibold select-all text-center">
                  {formEmail || 'votre.collaborateur@entreprise-rpa.com'}
                </div>
              </div>

              {/* Optional dynamic latency selector */}
              <div className="flex items-center justify-between bg-amber-50/50 border border-amber-200/60 rounded-lg p-2.5 my-2">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-[10px] text-amber-950 uppercase flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${networkLatencyMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    Simuler latence réseau (Aléas SaaS)
                  </span>
                  <p className="text-[9px] text-amber-800 leading-tight">Ajoute +2.5s de délai à chaque étape pour forcer le seuil de 3s</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    id="checkbox-network-latency-mode"
                    type="checkbox"
                    checked={networkLatencyMode}
                    onChange={(e) => {
                      setNetworkLatencyMode(e.target.checked);
                      addLog({
                        id: Math.random().toString(),
                        timestamp: new Date().toLocaleTimeString(),
                        type: 'info',
                        message: e.target.checked 
                          ? '📶 [LENTEUR LOGICIELLE] Mode simulant de grands aléas réseau activé (+2500ms).'
                          : '📶 [RÉSEAU SAIN] Mode latence désactivé.'
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Control triggers */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 font-semibold select-none">
                <button
                  id="btn-fast-onboard"
                  type="submit"
                  disabled={isSimulating}
                  className="flex-1 bg-slate-900 hover:bg-slate-950 disabled:opacity-50 text-white py-2 rounded-lg text-center font-bold tracking-tight text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  Lancer Onboarding RPA
                </button>
                <button
                  id="btn-fast-offboard"
                  type="button"
                  disabled={isSimulating}
                  onClick={() => launchOffboarding(formEmail)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50 px-3 py-2 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-rose-150 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Révocation RPA
                </button>
              </div>
            </form>

            {/* Quick pre-configured demo workflow guide for the jury */}
            <div className="border border-indigo-100 bg-indigo-50/50 p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-700 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-slate-900">Validation Isolée (Preuve d'Action devant le Jury) :</span>
                <span>
                  Pour une démonstration fluide, vous pouvez cliquer sur <strong>Onboarding Démo</strong> en bas du terminal ou utiliser la commande de raccourci ci-dessus. Le robot prendra le contrôle visuel du simulateur de navigateur ci-contre !
                </span>
              </div>
            </div>
          </div>

          {/* Interactive RPA CLI Terminal */}
          <RpaTerminal
            logs={logs}
            onAddLog={addLog}
            onClearLogs={clearLogs}
            onTriggerOnboard={launchOnboarding}
            onTriggerOffboard={launchOffboarding}
            isSimulating={isSimulating}
            onUndoLastAction={handleUndoLastAction}
          />

          {/* Realtime Event Journal (Journal des Événements) */}
          <EventJournal
            logs={logs}
            onClearLogs={clearLogs}
          />

          {/* Registry of active simulated access certificates */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Registre d'Accès de l'Entreprise Simulé
              </h3>
              <button
                id="btn-export-pdf"
                onClick={exportPDF}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 transition text-[10px] cursor-pointer flex items-center gap-1.5 shrink-0 select-none shadow-xs"
                title="Télécharger la preuve au format PDF"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Exporter PDF
              </button>
            </div>
            <div className="space-y-2 text-[10px] text-slate-500">
              {collaborators.map((c) => (
                <div key={c.id} className="bg-slate-50/60 border border-slate-200/40 p-3 rounded-lg flex items-center justify-between gap-2.5 hover:border-slate-300/60 transition">
                  <div className="space-y-1.5">
                    <span className="text-slate-900 font-bold block text-[11.5px]">{c.firstname} {c.lastname}</span>
                    <span className="text-slate-400 block font-mono text-[9px]">{c.email}</span>
                    <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wide">
                      {c.role} — {c.department}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {c.status === 'active' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-bold px-2 py-0.5 rounded-full select-none text-[8.5px] uppercase tracking-wide flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Actif
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-200/50 font-bold px-2 py-0.5 rounded-full select-none text-[8.5px] uppercase tracking-wide">
                        RÉVOQUÉ
                      </span>
                    )}
                    <div className="flex gap-1.5 select-none">
                      <span className={`w-4 h-4 rounded-full text-[8.5px] font-bold text-white flex items-center justify-center shadow-xs transition duration-200 ${c.platforms.email && c.status === 'active' ? 'bg-indigo-600' : 'bg-slate-200'}`} title="Email (ProMail)">M</span>
                      <span className={`w-4 h-4 rounded-full text-[8.5px] font-bold text-white flex items-center justify-center shadow-xs transition duration-200 ${c.platforms.storage && c.status === 'active' ? 'bg-blue-600' : 'bg-slate-200'}`} title="Storage (Vault)">S</span>
                      <span className={`w-4 h-4 rounded-full text-[8.5px] font-bold text-white flex items-center justify-center shadow-xs transition duration-200 ${c.platforms.chat && c.status === 'active' ? 'bg-emerald-600' : 'bg-slate-200'}`} title="Chat (CollabChat)">C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: VISUAL BROWSER SIMULATOR & ACADEMIC DOSSIER (lg:col-span-7) --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dynamic Browser Simulator for RPA visualization */}
          <BrowserSimulator
            activePlatform={activePlatform}
            collaborators={collaborators}
            isSimulating={isSimulating}
            simulationStep={simulationStepIndex}
            simulationSteps={simulationSteps}
            currentInputText={currentInputText}
            cursorPos={cursorPos}
            cursorState={cursorState}
            highlightedElementId={highlightedElementId}
            onSetPlatform={setActivePlatform}
            tempSimulatedUser={currentOnboardingData}
          />

          {/* Dashboard Stats with Recharts analytics */}
          <DashboardStats collaborators={collaborators} />

          {/* Academic information block describing how the RPA tackles no-API environments */}
          <AcademicThesis />

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-slate-900 text-gray-400 text-xs px-6 py-4 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Plateforme RPA Démonstration Mémoire Académique — 2026</span>
          <span className="text-gray-500 italic">Conçu spécialement pour la soutenance orale et l'évaluation du jury</span>
        </div>
      </footer>
    </div>
  );
}

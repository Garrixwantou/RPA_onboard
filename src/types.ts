/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Collaborator {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  platforms: {
    email: boolean;
    storage: boolean;
    chat: boolean;
  };
  created_at: string;
}

export type RpaPlatform = 'PROMAIL' | 'CLOUD_VAULT' | 'COLLAB_CHAT';

export type LogType = 'info' | 'success' | 'warning' | 'error' | 'command';

export interface RpaLog {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  platform?: RpaPlatform;
}

export interface SimulationStep {
  platform: RpaPlatform;
  action: 'navigate' | 'focus' | 'type' | 'click' | 'wait' | 'success';
  targetId?: string; // HTML element selector simulation target
  value?: string;
  logMessage: string;
  duration: number; // Duration of this step in ms
}

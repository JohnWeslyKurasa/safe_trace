import type { User } from './types';
import { api } from './api';

export type AppTab = 
  | 'dashboard' 
  | 'cases' 
  | 'studio' 
  | 'leads' 
  | 'clusters' 
  | 'map' 
  | 'antifraud' 
  | 'sightings' 
  | 'reunification' 
  | 'audit';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  title: string;
  message: string;
  timestamp: number;
}

class AppState {
  private user: User | null = null;
  private activeTab: AppTab = 'dashboard';
  private selectedCaseId: string | null = null;
  private selectedLeadId: string | null = null;
  private searchQuery: string = '';
  private isAIProcessing = false;
  private mobileSidebarOpen = false;
  private toasts: ToastMessage[] = [];
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User | null) {
    this.user = user;
    this.notify();
  }

  getActiveTab(): AppTab {
    return this.activeTab;
  }

  setActiveTab(tab: AppTab) {
    this.activeTab = tab;
    this.mobileSidebarOpen = false;
    this.notify();
  }

  getSelectedCaseId(): string | null {
    return this.selectedCaseId;
  }

  setSelectedCaseId(id: string | null) {
    this.selectedCaseId = id;
    this.notify();
  }

  getSelectedLeadId(): string | null {
    return this.selectedLeadId;
  }

  setSelectedLeadId(id: string | null) {
    this.selectedLeadId = id;
    this.notify();
  }

  getSearchQuery(): string {
    return this.searchQuery;
  }

  setSearchQuery(q: string) {
    this.searchQuery = q;
    this.notify();
  }

  getMobileSidebarOpen(): boolean {
    return this.mobileSidebarOpen;
  }

  setMobileSidebarOpen(open: boolean) {
    this.mobileSidebarOpen = open;
    this.notify();
  }

  getIsAIProcessing(): boolean {
    return this.isAIProcessing;
  }

  setIsAIProcessing(isProcessing: boolean) {
    this.isAIProcessing = isProcessing;
    this.notify();
  }

  getToasts(): ToastMessage[] {
    return this.toasts;
  }

  addToast(toast: Omit<ToastMessage, 'id' | 'timestamp'>) {
    const newToast: ToastMessage = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    this.toasts.push(newToast);
    this.notify();

    setTimeout(() => {
      this.removeToast(newToast.id);
    }, 4500);
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  async initAuth() {
    const token = api.getToken();
    if (token) {
      try {
        const res = await api.getMe();
        this.setUser(res.user);
      } catch (err) {
        console.warn('Session expired, logging into default investigator demo role');
        await this.switchRole('investigator');
      }
    } else {
      await this.switchRole('investigator');
    }
  }

  async switchRole(role: 'investigator' | 'family' | 'admin' | 'public' | 'organization') {
    try {
      this.setIsAIProcessing(true);
      const res = await api.demoLogin(role);
      this.setUser(res.user);
      this.addToast({
        type: 'success',
        title: `Switched Role: ${role.toUpperCase()}`,
        message: `Authenticated as ${res.user.name} (${res.user.email})`,
      });
    } catch (err: any) {
      console.error('Failed to switch role:', err);
      this.setUser({
        id: 'demo-investigator',
        name: 'Maria Rossi',
        email: 'maria@example.com',
        role,
        isVerified: true,
        badgeNumber: 'ST-INV-8492'
      });
    } finally {
      this.setIsAIProcessing(false);
    }
  }

  logout() {
    api.setToken(null);
    this.setUser(null);
    this.addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been successfully signed out.',
    });
    this.initAuth();
  }
}

export const state = new AppState();

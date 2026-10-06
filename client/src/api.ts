import type { User, MissingCase, MatchLead, Sighting, CaseCluster, PatternAlert, ConsentRecord, AuditLog, SecureMessage } from './types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = localStorage.getItem('safetrace_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('safetrace_token', token);
    } else {
      localStorage.removeItem('safetrace_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // --- Auth & Users ---
  async login(email: string, password: string): Promise<{ token: string; user: User; requiresOtp?: boolean; tempToken?: string }> {
    const res = await this.request<{ token: string; user: User; requiresOtp?: boolean; tempToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async verifyOtp(email: string, otp: string, tempToken?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, tempToken }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async demoLogin(role: 'investigator' | 'family' | 'admin' | 'public' | 'organization'): Promise<{ token: string; user: User }> {
    const emailMap = {
      investigator: 'maria@example.com',
      family: 'sarah@example.com',
      admin: 'admin@safetrace.com',
      public: 'john@example.com',
      organization: 'org@hopefoundation.com',
    };
    const email = emailMap[role];
    const loginRes = await this.login(email, 'password123');
    if (loginRes.token) {
      return loginRes;
    }
    return this.verifyOtp(email, '123456', loginRes.tempToken);
  }

  // --- Cases ---
  async getCases(params?: Record<string, string>): Promise<{ cases: MissingCase[]; total: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ cases: MissingCase[]; total: number }>(`/cases${query}`);
  }

  async getCaseById(id: string): Promise<{ caseItem: MissingCase; leads: MatchLead[]; sightings: Sighting[]; consent: ConsentRecord[] }> {
    return this.request<{ caseItem: MissingCase; leads: MatchLead[]; sightings: Sighting[]; consent: ConsentRecord[] }>(`/cases/${id}`);
  }

  async createCase(caseData: Partial<MissingCase>): Promise<{ caseItem: MissingCase }> {
    return this.request<{ caseItem: MissingCase }>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async updateCase(id: string, updates: Partial<MissingCase>): Promise<{ caseItem: MissingCase }> {
    return this.request<{ caseItem: MissingCase }>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // --- Sightings ---
  async getSightings(params?: Record<string, string>): Promise<{ sightings: Sighting[]; total: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ sightings: Sighting[]; total: number }>(`/sightings${query}`);
  }

  async createSighting(sightingData: Partial<Sighting>): Promise<{ sighting: Sighting; fraudScore: number; leadsGenerated: number }> {
    return this.request<{ sighting: Sighting; fraudScore: number; leadsGenerated: number }>('/sightings', {
      method: 'POST',
      body: JSON.stringify(sightingData),
    });
  }

  // --- Match Leads & Decision Intelligence ---
  async getLeads(params?: Record<string, string>): Promise<{ leads: MatchLead[]; total: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ leads: MatchLead[]; total: number }>(`/leads${query}`);
  }

  async verifyLead(id: string, decision: 'verified' | 'rejected' | 'inconclusive', notes: string): Promise<{ lead: MatchLead }> {
    return this.request<{ lead: MatchLead }>(`/leads/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  // --- Clusters & Patterns ---
  async getClusters(): Promise<{ clusters: CaseCluster[] }> {
    return this.request<{ clusters: CaseCluster[] }>('/clusters');
  }

  async getPatternAlerts(): Promise<{ alerts: PatternAlert[] }> {
    return this.request<{ alerts: PatternAlert[] }>('/pattern-alerts');
  }

  async acknowledgePatternAlert(id: string): Promise<{ alert: PatternAlert }> {
    return this.request<{ alert: PatternAlert }>(`/pattern-alerts/${id}/ack`, {
      method: 'POST',
    });
  }

  // --- AI Multimodal Analysis Studio ---
  async analyzeMultimodal(data: {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    caseId?: string;
    targetCaseIds?: string[];
  }): Promise<{
    explanation: string;
    confidenceScore: number;
    crossModalScore: number;
    extractedEntities: Record<string, any>;
    featureBreakdown: Record<string, number>;
    guardrailCompliance: {
      isAutonomousDecisionBlocked: boolean;
      piiRedacted: boolean;
      humanReviewMandatory: boolean;
    };
    suggestedMatches: Array<{
      caseId: string;
      confidence: number;
      rationale: string;
      features: string[];
    }>;
  }> {
    return this.request('/ai/analyze-multimodal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Privacy & Consent Management ---
  async getConsentRecords(caseId?: string): Promise<{ records: ConsentRecord[] }> {
    const query = caseId ? `?caseId=${caseId}` : '';
    return this.request<{ records: ConsentRecord[] }>(`/consent${query}`);
  }

  async updateConsent(consentId: string, status: 'granted' | 'revoked', scope?: string): Promise<{ record: ConsentRecord }> {
    return this.request<{ record: ConsentRecord }>(`/consent/${consentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, scope }),
    });
  }

  // --- Secure Messaging / Reunification Room ---
  async getMessages(caseId: string): Promise<{ messages: SecureMessage[] }> {
    return this.request<{ messages: SecureMessage[] }>(`/messages/${caseId}`);
  }

  async sendMessage(caseId: string, recipientId: string, content: string): Promise<{ message: SecureMessage }> {
    return this.request<{ message: SecureMessage }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ caseId, recipientId, content }),
    });
  }

  // --- Audit Logs ---
  async getAuditLogs(params?: Record<string, string>): Promise<{ logs: AuditLog[]; total: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ logs: AuditLog[]; total: number }>(`/audit-logs${query}`);
  }

  // --- System Health ---
  async getHealth(): Promise<{ status: string; aiMode: string; otpMode: string; version: string }> {
    return this.request('/health');
  }
}

export const api = new ApiService();

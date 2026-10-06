export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'investigator' | 'family' | 'admin' | 'public' | 'organization';
  phone?: string;
  organization?: string;
  isVerified?: boolean;
  avatar?: string;
  badgeNumber?: string;
}

export interface MissingCase {
  _id: string;
  caseNumber: string;
  fullName: string;
  aliases?: string[];
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  dateOfBirth?: string;
  lastSeenDate: string;
  lastSeenLocation: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  physicalDescription: {
    heightCm?: number;
    weightKg?: number;
    eyeColor?: string;
    hairColor?: string;
    complexion?: string;
    distinguishingFeatures?: string[];
    clothingLastSeen?: string;
  };
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'sighting_pending' | 'verified_lead' | 'reunification_in_progress' | 'reunified' | 'archived' | 'closed';
  photos: Array<{
    url: string;
    caption?: string;
    isPrimary?: boolean;
    uploadedAt?: string;
  }>;
  voiceRecordings?: Array<{
    url: string;
    description?: string;
    duration?: number;
    uploadedAt?: string;
  }>;
  circumstances?: string;
  assignedInvestigator?: User | string;
  registeredBy?: User | string;
  contactConsent: {
    allowPublicSightings: boolean;
    requireInvestigatorApproval: boolean;
    allowDirectReunificationContact: boolean;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchLead {
  _id: string;
  caseId: MissingCase | string;
  sightingId?: any;
  confidenceScore: number;
  matchType: 'facial_similarity' | 'voice_biometrics' | 'cross_modal' | 'text_description' | 'pattern_proximity';
  status: 'pending' | 'under_review' | 'verified' | 'dismissed' | 'escalated';
  summary: string;
  breakdown: {
    facialScore?: number;
    voiceScore?: number;
    clothingScore?: number;
    locationScore?: number;
    temporalScore?: number;
    contextScore?: number;
  };
  featureContributions: Array<{
    feature: string;
    weight: number;
    explanation: string;
  }>;
  aiExplanation: string;
  limitationsAndBiasWarning: string;
  humanVerificationStatus: 'pending' | 'verified' | 'rejected' | 'inconclusive';
  verifiedBy?: User | string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Sighting {
  _id: string;
  caseId?: MissingCase | string;
  sightingDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  reporter: {
    name?: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    credibilityScore?: number;
  };
  description: string;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  audioRecordings?: Array<{
    url: string;
    duration?: number;
  }>;
  credibilityScore: number;
  antiFraudStatus: 'verified' | 'suspicious' | 'flagged_bot' | 'passed';
  fraudFlags?: string[];
  status: 'new' | 'investigating' | 'correlated' | 'dismissed';
  createdAt: string;
}

export interface CaseCluster {
  _id: string;
  clusterName: string;
  clusterType: 'geographic_corridor' | 'demographic' | 'temporal_spike' | 'modus_operandi';
  description: string;
  riskAssessment: 'critical' | 'elevated' | 'moderate' | 'low';
  caseIds: MissingCase[];
  centerLocation?: {
    lat: number;
    lng: number;
    radiusKm?: number;
  };
  patternSummary: string;
  aiConfidence: number;
  createdAt: string;
}

export interface PatternAlert {
  _id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  category: 'transit_corridor' | 'temporal_cluster' | 'demographic_pattern' | 'fraud_spike';
  description: string;
  affectedCases: MissingCase[];
  recommendedAction: string;
  acknowledgedBy?: User[];
  createdAt: string;
}

export interface ConsentRecord {
  _id: string;
  caseId: MissingCase | string;
  partyType: 'family' | 'witness' | 'investigator' | 'subject';
  partyId: User | string;
  consentType: 'data_processing' | 'facial_search' | 'contact_sharing' | 'reunification_meeting';
  status: 'granted' | 'revoked' | 'pending';
  scope: string;
  grantedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userId?: User | string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface SecureMessage {
  _id: string;
  caseId: string;
  senderId: User | string;
  senderRole?: string;
  senderName?: string;
  recipientId: User | string;
  content: string;
  isEncrypted: boolean;
  read: boolean;
  createdAt: string;
}

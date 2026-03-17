export interface UserProfile {
  uid: string;
  displayName: string;
  patientName?: string;
  companionName?: string;
  email: string;
  companionAvatar?: string;
  companionVoice?: string;
  dateOfBirth?: string;
  homeAddress?: string;
  profilePicture?: string;
  medications?: string[];
  conditions?: string[];
  allergies?: string[];
  createdAt: any;
}

export interface MemoryItem {
  id?: string;
  uid: string;
  type: 'image' | 'story' | 'family_member' | 'email' | 'calendar';
  content: string;
  imageUrl?: string;
  metadata?: any;
  createdAt: any;
}

export interface ChatMessage {
  id?: string;
  uid: string;
  role: 'user' | 'model';
  text: string;
  timestamp: any;
  isVoice?: boolean;
}

export interface CompanionOption {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

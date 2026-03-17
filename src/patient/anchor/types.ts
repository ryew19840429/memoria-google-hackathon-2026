export interface LovedOne {
  id: string;
  name: string;
  relationship: string;
  imageUrl: string;
  phoneNumber: string;
  greeting: string;
}

export type AppView = 'identify' | 'settings';

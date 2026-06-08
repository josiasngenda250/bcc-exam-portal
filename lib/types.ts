export type Language = 'en' | 'fr' | 'rw';
export type PromotionType = 'online' | 'in_person';
export type CanadaRegion = 'east' | 'west';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: Language;
  country: string;
  promotionType?: PromotionType;
  region?: CanadaRegion;
  province?: string;
  createdAt: string;
}

export interface BccClass {
  id: string;
  order: number;
  title: string;
  isOpen: boolean;
  openedAt: string | null;
  closedAt: string | null;
  maxScore: Record<Language, number>;
}

export interface Question {
  id: string;
  classId: string;
  index: number;
  type: 'mcq' | 'yesno';
  text: Record<Language, string>;
  options: Record<Language, string[]>;
  correct: Record<Language, string>;
}

export interface Attempt {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberCountry: string;
  classId: string;
  language: Language;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  submittedAt: string;
  attemptNumber: number;
}

export type Language      = 'en' | 'fr' | 'rw';
export type PromotionType = 'online' | 'in_person';
export type CanadaRegion  = 'east' | 'west';
export type GroupId       = 'in_person' | 'online_east' | 'online_west';

export const GROUPS: { id: GroupId; label: string; subtitle: string; icon: string }[] = [
  { id: 'in_person',   label: 'In-Person — ERC Church',      subtitle: 'Physical attendance at church location', icon: '🏛️' },
  { id: 'online_east', label: 'Online — East Canada',         subtitle: 'Ottawa · Toronto · Montréal · and more', icon: '💻' },
  { id: 'online_west', label: 'Online — West Canada',         subtitle: 'Edmonton · Vancouver · Calgary · and more', icon: '🌐' },
];

/** Derive which group a member belongs to from their registration data. */
export function getMemberGroup(member: Member): GroupId {
  if (member.promotionType === 'in_person') return 'in_person';
  if (member.region === 'west') return 'online_west';
  return 'online_east'; // online + east, or no region set → default East
}

/** Is this class open for the given group? Handles legacy isOpen field. */
export function isClassOpenForGroup(cls: BccClass, group: GroupId): boolean {
  if (cls.isOpenFor) return cls.isOpenFor[group] ?? false;
  return cls.isOpen ?? false; // legacy fallback
}

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
  /** New: per-group open state */
  isOpenFor: Record<GroupId, boolean>;
  /** Legacy: kept for backward compat, ignored when isOpenFor is present */
  isOpen?: boolean;
  openedAt?: string | null;
  closedAt?: string | null;
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

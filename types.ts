
export interface OrganPart {
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface OrganData {
  id: string;
  name: string;
  category: string;
  particleCount: number;
  colors: string[];
  lightColors: string[];
  accentColor: string;
  glowColor: string;
  tagline: string;
  stat: { label: string; value: string };
  description: string;
  facts: string[];
  parts: OrganPart[];
  animations: string[];
  quiz: QuizQuestion[];
  icon: string;
  modelPath?: string;
  cameraPosition?: { x: number; y: number; z: number };
}

export type BodySystem = 'Nervous System' | 'Cardiovascular System' | 'Respiratory System' | 'Digestive System' | 'Excretory System' | 'Musculoskeletal System' | 'Integumentary System' | 'all';

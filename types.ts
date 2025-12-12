
export type ImageSize = '1K' | '2K' | '4K';

export type AppView = 'renovator' | 'history' | 'chat' | 'settings' | 'admin';

export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  plan: SubscriptionPlan;
  tokens: number; // Added Token Balance
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// Keep Enums for type safety in code logic, but UI generation will use DB data
export enum RenovatorStyle {
  Modern = 'Modern',
  Scandinavian = 'Scandinavian',
  Industrial = 'Industrial',
  Classic = 'Classic',
  Minimalist = 'Minimalist',
  Bohemian = 'Bohemian',
  Luxury = 'Luxury',
  Neoclassic = 'Neoclassic',
  ArtDeco = 'Art Deco',
  Mediterranean = 'Mediterranean',
  Japandi = 'Japandi',
  Cyberpunk = 'Cyberpunk',
  Farmhouse = 'Farmhouse',
  Baroque = 'Baroque',
  Steampunk = 'Steampunk',
  Gothic = 'Gothic',
  Coastal = 'Coastal',
  Rustic = 'Rustic'
}

export enum RoomType {
  LivingRoom = 'Living Room',
  Bedroom = 'Bedroom',
  Kitchen = 'Kitchen',
  Bathroom = 'Bathroom',
  Hallway = 'Hallway',
  Office = 'Office',
  Balcony = 'Balcony',
  DiningRoom = 'Dining Room',
  GamingRoom = 'Gaming Room',
  HomeGym = 'Home Gym',
  Library = 'Library',
  HomeTheater = 'Home Theater',
  Attic = 'Attic',
  Basement = 'Basement',
  WalkInCloset = 'Walk-in Closet',
  Other = 'Other'
}

export enum FlooringType {
  Hardwood = 'Hardwood',
  Laminate = 'Laminate',
  Tile = 'Tile',
  Marble = 'Marble',
  Carpet = 'Carpet',
  Concrete = 'Concrete',
  Epoxy = 'Epoxy',
  Stone = 'Stone'
}

// --- DB Entities ---

export interface DbStyle {
  id: string;
  label: string;
  value: string; // Maps to RenovatorStyle enum
  description?: string;
}

export interface DbRoom {
  id: string;
  label: string;
  value: string; // Maps to RoomType enum
}

export interface DbColor {
  id: string;
  name: string;
  value: string;
  bgClass: string; // Tailwind class or hex
}

export interface DbFlooring {
  id: string;
  label: string;
  value: string;
  colorClass: string;
}

export interface DbFurniture {
  id: string;
  label: string;
  icon: string; // String name of the Lucide icon
  roomTypes: string[]; // Array of RoomType values or 'all'
}

export interface DbPreset {
  id: string;
  name: string;
  style: string;
  colors: string[];
  flooring: string;
  icon: string;
}

export interface AppContent {
  styles: DbStyle[];
  rooms: DbRoom[];
  colors: DbColor[];
  flooring: DbFlooring[];
  furniture: DbFurniture[];
  presets: DbPreset[];
}

export interface RoomDimensions {
  width?: string;
  length?: string;
  area?: string;
}

export interface RenovationConfig {
  style: RenovatorStyle;
  roomType: RoomType;
  customRoomType?: string;
  colorPreference: string[];
  flooring: FlooringType;
  size: ImageSize;
  selectedFurniture: string[];
  country: string;
  includeBlueprint: boolean;
  dimensions?: RoomDimensions;
}

export interface RenovationAnalysis {
  estimatedBudgetRange: string;
  difficultyLevel: 'Asan' | 'Orta' | 'Çətin';
  materials: string[];
  furnitureToBuy: string[];
  designTips: string[];
  steps: string[];
}

export interface SavedProject {
  id: string;
  userId?: string;
  userEmail?: string;
  timestamp: number;
  originalImage: string;
  generatedImage: string;
  config: RenovationConfig;
  analysis?: RenovationAnalysis;
}

export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalGenerations: number;
  totalRevenue: number;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

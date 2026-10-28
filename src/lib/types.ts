export type PlanCategory =
  | 'deporte'
  | 'playa'
  | 'musica'
  | 'naturaleza'
  | 'tardeo'
  | 'estudio'
  | 'videojuegos'
  | 'quedada';

export interface UserProfile {
  id: string;
  username: string; // e.g. "@rosa_burriana"
  fullName: string;
  avatar: string;
  school: string; // e.g. "Col·legi Ntra. Sra. de la Consolació"
  bio: string;
  interests: string[];
  followersCount: number;
  followingCount: number;
  isFollowedByMe?: boolean;
}

export interface PlanAttendee {
  userId: string;
  fullName: string;
  username: string;
  avatar: string;
  school: string;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  planId: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar: string;
  senderSchool: string;
  text: string;
  timestamp: string;
}

export interface PlanRating {
  id: string;
  planId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userSchool: string;
  stars: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface PlanPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: PlanCategory;
  place_name: string;
  place_address: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'past';
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorSchool: string;
  coverPhoto: string;
  photos: PlanPhoto[];
  attendees: PlanAttendee[];
  chatMessages: ChatMessage[];
  ratings: PlanRating[];
  hasReminder?: boolean;
}

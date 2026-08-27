export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  coverArt: string;
  duration: number; // in seconds
  genre: 'Southern Rap' | 'Trap' | 'Drill' | 'R&B' | 'Hip Hop' | 'Soul';
  audioUrl?: string;
  beatType: string;
  bpm: number;
  key: string;
  plays: number;
  cashEarned: number;
  likes: number;
  lyrics: string;
  isBamaSlammerOfficial?: boolean;
  crewName?: string;
  releaseDate: string;
}

export interface BattleMatch {
  id: string;
  title: string;
  potAmount: number; // Cash pot e.g. $500
  category: string;
  status: 'voting_open' | 'revealed' | 'completed';
  trackA: {
    track: Track;
    anonymousAlias: string;
    votes: number;
  };
  trackB: {
    track: Track;
    anonymousAlias: string;
    votes: number;
  };
  userVoted?: 'A' | 'B';
  minListenSeconds: number;
  endsInSeconds: number;
  description: string;
}

export interface Crew {
  id: string;
  name: string;
  tag: string;
  leader: string;
  leaderAvatar: string;
  membersCount: number;
  totalEarnings: number;
  battleWins: number;
  rank: number;
  bannerImage: string;
  bio: string;
  isRecruiting: boolean;
  minPointsToJoin: number;
  members: {
    id: string;
    name: string;
    role: 'Leader' | 'Co-Leader' | 'Producer' | 'Top Lyricist' | 'Member';
    points: number;
  }[];
  recentDrops: string[];
}

export interface L4LTrack {
  id: string;
  track: Track;
  requestedBy: string;
  creditsOffered: number;
  listensRequired: number;
  listensCompleted: number;
  feedbackGiven: {
    reviewerName: string;
    rating: number;
    comment: string;
    timestamp: string;
  }[];
}

export interface BlockedArtist {
  id: string;
  artistName: string;
  avatar: string;
  blockedAt: string;
  reason: string;
}

export interface StudioBeat {
  id: string;
  name: string;
  producer: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  synthPattern: string; // Used by our Web Audio synthesizer
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cashBalance: number; // in USD
  listenCredits: number; // For L4L
  stagePoints: number;
  crewId?: string;
  crewName?: string;
  tracksCount: number;
  battlesWon: number;
  isVerified: boolean;
}

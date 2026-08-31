export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  coverArt: string;
  duration: number; // in seconds (Max 120s for Solo, 360s for Collab, 180s for Battle)
  dropType: 'solo' | 'collab' | 'battle';
  genre: 'Southern Rap' | 'Trap' | 'Drill' | 'R&B' | 'Hip Hop' | 'Soul';
  audioUrl?: string;
  beatType: string;
  bpm: number;
  key: string;
  plays: number; // Counted live
  views: number; // Live views ticker
  cashEarned: number;
  likes: number;
  lyrics: string;
  isBamaSlammerOfficial?: boolean;
  crewName?: string;
  releaseDate: string;
  collabOpen?: boolean;
  collabArtists?: string[];
  isSpotlightPinned?: boolean;
  spotlightRemainingSeconds?: number;
}

export interface BattleBaseballCard {
  id: string;
  artistName: string;
  artistHandle: string;
  avatar: string;
  crewName: string;
  hometown: string;
  rankBadge: string;
  tier: 'Diamond Legend' | 'Platinum Elite' | 'Gold Heavyweight' | 'Silver Contender' | 'Rookie';
  record: {
    wins: number;
    losses: number;
    winRate: number;
    koRounds: number;
  };
  stagePoints: number;
  reputationScore: number;
  styleTags: string[];
  signatureMove: string;
  trackTitle: string;
  trackDurationSec: number; // Max 180s
  trackBeat: string;
  audioPreviewUrl?: string;
  isBlindInvite: boolean; // If true, track name and stats visible on card, but audio preview locked until battle starts
  acceptingLiveAudioBattle: boolean;
  acceptingLiveVideoBattle: boolean;
  acceptingCollabs: boolean;
  bio: string;
  cardFoilEffect?: 'gold_hologram' | 'silver_chrome' | 'emerald_prism' | 'ruby_fire';
}

export interface BattleMatch {
  id: string;
  title: string;
  potAmount: number; // Cash pot e.g. $500
  category: string;
  status: 'voting_open' | 'revealed' | 'completed';
  battleDurationTotalHours: number; // 48 hours standard
  battleSecondsRemaining: number; // Live countdown (starts at 172,800 sec / 48 hrs)
  startedAt: string;
  endsAtDailyEst: '7:00 PM EST' | '9:00 PM EST' | '11:00 PM EST';
  isBlind: boolean;
  isLiveAudio: boolean;
  isLiveVideo: boolean;
  trackA: {
    track: Track;
    card: BattleBaseballCard;
    anonymousAlias: string;
    votes: number;
    plays: number;
  };
  trackB: {
    track: Track;
    card: BattleBaseballCard;
    anonymousAlias: string;
    votes: number;
    plays: number;
  };
  userVoted?: 'A' | 'B';
  minListenSeconds: number;
  description: string;
}

export interface CallToBattleMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCrew: string;
  senderCard: BattleBaseballCard;
  text: string;
  timestamp: string;
  isBattleChallenge: boolean;
  challengeDetails?: {
    potAmount: number;
    isBlind: boolean;
    isLiveAudio: boolean;
    isLiveVideo: boolean;
    stakeType: 'free' | 'bucks' | 'coins';
    beatName: string;
    acceptedBy?: string;
  };
}

export interface Contest {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  grandPrizePot: number; // In Cash Stage Bucks ($)
  bonusCoins: number;
  description: string;
  rules: string[];
  bannerImage: string;
  deadlineText: string;
  endsInDays: number;
  totalEntries: number;
  entryFeeBucks: number;
  category: 'Southern Rap Battle Royale' | 'Best 808 Hook Collab' | 'Dirty South Freestyle' | 'Live DJ Mix';
  isOfficial: boolean;
  userEntered?: boolean;
}

export interface DjRadioSlot {
  id: string;
  day: 'Saturday' | 'Sunday';
  timeSlot: string; // e.g. "8:00 PM - 8:30 PM EST"
  durationMinutes: 30;
  priceUsd: 10.00;
  priceCoins: 1000;
  djName?: string;
  djAvatar?: string;
  djCrew?: string;
  setTitle?: string;
  genre?: string;
  isBooked: boolean;
  streamLiveNow?: boolean;
}

export interface DailyRankingCategory {
  title: string;
  subtitle: string;
  postTimeEST: string; // "7:00 PM EST" for Battlers, "9:00 PM EST" for Collabs, "11:00 PM EST" for Crews
  nextPostTimeRemaining: string;
  type: 'battlers' | 'collabs' | 'crews';
  leaderboard: {
    rank: number;
    name: string;
    avatar: string;
    badge: string;
    scoreLabel: string;
    scoreValue: string | number;
    change: 'up' | 'down' | 'same';
    cashEarned: number;
  }[];
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  priceCoins: number;
  type: 'extra_solo_drop' | 'extra_battle_drop' | 'live_feed_spotlight' | 'dj_radio_rsvp' | 'coin_bundle';
  tag?: string;
  icon: string;
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
  isL4LBattle?: boolean;
  battlePotCredits?: number;
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

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'listening' | 'voting' | 'recording' | 'tipping' | 'l4l' | 'social';
  currentProgress: number;
  targetProgress: number;
  unit: string;
  rewardPoints: number;
  rewardCash?: number;
  rewardCredits?: number;
  rewardCoins?: number;
  isCompleted: boolean;
  isClaimed: boolean;
  iconName: 'Disc' | 'Vote' | 'Mic2' | 'DollarSign' | 'Repeat' | 'Flame' | 'Trophy' | 'Sparkles';
  actionTab: 'listen_now' | 'recording_studio' | 'anonymous_voting' | 'listen_4_listen' | 'crews';
  actionLabel: string;
}

export interface DailyMissionState {
  streakDays: number;
  lastActiveDate: string;
  bonusGrandChestClaimed: boolean;
  grandChestBonusPoints: number;
  grandChestBonusCash: number;
  missions: DailyMission[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cashBalance: number; // Cash Stage Bucks ($ USD)
  stageCoins: number; // Cash Stage Coins (🪙)
  listenCredits: number; // For L4L
  stagePoints: number;
  crewId?: string;
  crewName?: string;
  tracksCount: number;
  battlesWon: number;
  battlesLost: number;
  isVerified: boolean;
  acceptingLiveAudioBattle: boolean;
  acceptingLiveVideoBattle: boolean;
  acceptingCollabs: boolean;
  baseballCard: BattleBaseballCard;
}


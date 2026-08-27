import { Track, BattleMatch, Crew, L4LTrack, StudioBeat, UserProfile, BlockedArtist } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_me_01',
  name: 'Bama Slammer',
  handle: '@missalabamaslammer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  cashBalance: 1250.00,
  listenCredits: 180,
  stagePoints: 4890,
  crewId: 'crew_bama_01',
  crewName: 'Bama Slammer Mob',
  tracksCount: 14,
  battlesWon: 27,
  isVerified: true,
};

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'trk_01',
    title: 'Cash Stage Anthem (Dirty South Mix)',
    artist: 'Alabama Slammer',
    artistId: 'art_bama',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    duration: 184,
    genre: 'Southern Rap',
    beatType: 'slammer_808_anthem',
    bpm: 142,
    key: 'F Minor',
    plays: 142800,
    cashEarned: 3420.50,
    likes: 18900,
    lyrics: `[Intro: Alabama Slammer]
Yeah! Welcome to the Cash Stage!
Bama in the building, put your money where your mic at!
Let's get it!

[Chorus]
Step up on the Cash Stage, throw that green high
Southern heavy 808s shaking up the sky
If you got the bars, put the crown on your head
Never fold, never slip, count the cash till we dead!
(Cash Stage, yeah we run the town!)

[Verse 1]
From Mobile to Birmingham, heavy on the beat
Slammer got the whole crowd standing on their feet
Listen for listen, we built this from the mud
Pure southern royalty running through my blood!`,
    isBamaSlammerOfficial: true,
    crewName: 'Bama Slammer Mob',
    releaseDate: '2026-08-15',
  },
  {
    id: 'trk_02',
    title: 'Rollin on 24s (Trap Heat)',
    artist: 'T-Roy Southern',
    artistId: 'art_troy',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    duration: 165,
    genre: 'Trap',
    beatType: 'trap_heat_banger',
    bpm: 138,
    key: 'C Minor',
    plays: 89300,
    cashEarned: 1850.00,
    likes: 11400,
    lyrics: `[Intro]
24 inches on the slab, midnight cruise...

[Chorus]
Rollin on 24s, windows tinted black
Cash Stage champion, never lookin back
Hit the gas pedal, hear the engine roar
Got the whole city knocking at my front door!`,
    crewName: 'Dixie 808 Cartel',
    releaseDate: '2026-08-18',
  },
  {
    id: 'trk_03',
    title: 'Queen of the Dirty South',
    artist: 'Alabama Slammer',
    artistId: 'art_bama',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    duration: 195,
    genre: 'Southern Rap',
    beatType: 'slammer_trap_anthem',
    bpm: 145,
    key: 'G# Minor',
    plays: 215400,
    cashEarned: 5120.00,
    likes: 29400,
    lyrics: `[Chorus]
Bow down to the Queen of the Dirty South
Keep my name shining when it leave your mouth
Stage light glowing, golden microphone
Took the battle arena and claimed the throne!`,
    isBamaSlammerOfficial: true,
    crewName: 'Bama Slammer Mob',
    releaseDate: '2026-08-01',
  },
  {
    id: 'trk_04',
    title: 'Midnight Velvet (Smooth R&B)',
    artist: 'Siren Raye',
    artistId: 'art_siren',
    artistAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    duration: 210,
    genre: 'R&B',
    beatType: 'rnb_velvet_chords',
    bpm: 96,
    key: 'Eb Major',
    plays: 64100,
    cashEarned: 1320.00,
    likes: 9200,
    lyrics: `[Verse 1]
Late night frequencies on the Cash Stage dial
Haven't heard real soul like this in a while...`,
    crewName: 'Cash Kings Syndicate',
    releaseDate: '2026-08-20',
  },
  {
    id: 'trk_05',
    title: 'Drill State of Mind',
    artist: 'Ghost 700',
    artistId: 'art_ghost',
    artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    duration: 172,
    genre: 'Drill',
    beatType: 'drill_808_slide',
    bpm: 144,
    key: 'D Minor',
    plays: 78500,
    cashEarned: 1450.00,
    likes: 8800,
    lyrics: `[Chorus]
Sliding on the 808, fast rhythm attack
Anonymous battle, you can't run it back!`,
    crewName: 'Southern Heat Dynasty',
    releaseDate: '2026-08-22',
  },
];

export const INITIAL_BATTLES: BattleMatch[] = [
  {
    id: 'bat_01',
    title: '👑 $500 Grand Cash Finals: Southern Royalty vs The Challenger',
    potAmount: 500.00,
    category: 'Southern Rap Championship',
    status: 'voting_open',
    trackA: {
      track: INITIAL_TRACKS[0], // Bama Slammer
      anonymousAlias: '🎭 Masked Contender Alpha',
      votes: 142,
    },
    trackB: {
      track: INITIAL_TRACKS[1], // T-Roy Southern
      anonymousAlias: '⚔️ Phantom Lyricist Omega',
      votes: 128,
    },
    minListenSeconds: 15,
    endsInSeconds: 3420,
    description: '100% Blind Anonymous Voting! Artist identities, profile pictures, and stream counts are hidden until you cast your vote. Pure talent decides who walks away with the $500 Cash Pot!',
  },
  {
    id: 'bat_02',
    title: '🔥 $250 Freestyle Showdown: R&B Soul vs Drill Fire',
    potAmount: 250.00,
    category: 'Versatility Clash',
    status: 'voting_open',
    trackA: {
      track: INITIAL_TRACKS[3], // Siren Raye
      anonymousAlias: '🎙️ Velvet Shadow',
      votes: 95,
    },
    trackB: {
      track: INITIAL_TRACKS[4], // Ghost 700
      anonymousAlias: '⚡ Cyber Ghost',
      votes: 104,
    },
    minListenSeconds: 15,
    endsInSeconds: 7800,
    description: 'Melody meets aggression. Blind vote to pick the ultimate sound.',
  },
];

export const INITIAL_CREWS: Crew[] = [
  {
    id: 'crew_bama_01',
    name: 'Bama Slammer Mob',
    tag: '[SLAM]',
    leader: 'Alabama Slammer',
    leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    membersCount: 48,
    totalEarnings: 18450.00,
    battleWins: 94,
    rank: 1,
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    bio: 'The undisputed royal house of Cash Stage founded by Alabama Slammer. Heavy southern 808s, lyrical precision, and unstoppable stage energy.',
    isRecruiting: true,
    minPointsToJoin: 1500,
    members: [
      { id: 'm1', name: 'Alabama Slammer', role: 'Leader', points: 4890 },
      { id: 'm2', name: 'Metro South', role: 'Producer', points: 3400 },
      { id: 'm3', name: 'D-Bama Flow', role: 'Top Lyricist', points: 2900 },
      { id: 'm4', name: 'Dixie Queen', role: 'Member', points: 2100 },
    ],
    recentDrops: ['Cash Stage Anthem', 'Queen of the Dirty South', 'Bama Mob Freestyle'],
  },
  {
    id: 'crew_dixie_02',
    name: 'Dixie 808 Cartel',
    tag: '[D808]',
    leader: 'T-Roy Southern',
    leaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    membersCount: 36,
    totalEarnings: 12100.00,
    battleWins: 67,
    rank: 2,
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    bio: 'Pounding 808 basslines and fast-paced southern street trap. We test our tracks in car trunks first.',
    isRecruiting: true,
    minPointsToJoin: 1000,
    members: [
      { id: 'd1', name: 'T-Roy Southern', role: 'Leader', points: 3900 },
      { id: 'd2', name: 'Subwoofer Kid', role: 'Producer', points: 2600 },
    ],
    recentDrops: ['Rollin on 24s', 'Cartel Anthem'],
  },
  {
    id: 'crew_kings_03',
    name: 'Cash Kings Syndicate',
    tag: '[KINGS]',
    leader: 'Siren Raye',
    leaderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    membersCount: 29,
    totalEarnings: 9800.00,
    battleWins: 52,
    rank: 3,
    bannerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    bio: 'Soulful melodies, high-production R&B and conscious lyricism taking over the tournament arena.',
    isRecruiting: false,
    minPointsToJoin: 2000,
    members: [
      { id: 'k1', name: 'Siren Raye', role: 'Leader', points: 3100 },
      { id: 'k2', name: 'Neo Soul Beats', role: 'Producer', points: 2200 },
    ],
    recentDrops: ['Midnight Velvet', 'Golden Hour R&B'],
  },
];

export const INITIAL_L4L_TRACKS: L4LTrack[] = [
  {
    id: 'l4l_01',
    track: INITIAL_TRACKS[1],
    requestedBy: 'T-Roy Southern',
    creditsOffered: 15,
    listensRequired: 20,
    listensCompleted: 14,
    feedbackGiven: [
      {
        reviewerName: 'DJ Slammer Fan',
        rating: 5,
        comment: 'The 808 hits crazy hard in the drop! Great cadence.',
        timestamp: '10m ago',
      },
      {
        reviewerName: 'Metro North',
        rating: 4,
        comment: 'Vocal mixing is clean, punch in on verse 2 was tight.',
        timestamp: '1h ago',
      },
    ],
  },
  {
    id: 'l4l_02',
    track: INITIAL_TRACKS[3],
    requestedBy: 'Siren Raye',
    creditsOffered: 12,
    listensRequired: 25,
    listensCompleted: 19,
    feedbackGiven: [
      {
        reviewerName: 'Vocal Coach Kev',
        rating: 5,
        comment: 'Warm vocal tone, lush chord progression!',
        timestamp: '35m ago',
      },
    ],
  },
  {
    id: 'l4l_03',
    track: INITIAL_TRACKS[4],
    requestedBy: 'Ghost 700',
    creditsOffered: 20,
    listensRequired: 30,
    listensCompleted: 8,
    feedbackGiven: [
      {
        reviewerName: 'Beat Maker Tre',
        rating: 4,
        comment: 'The slide on the bass note is aggressive, love the energy.',
        timestamp: '2h ago',
      },
    ],
  },
];

export const STUDIO_BEATS: StudioBeat[] = [
  {
    id: 'slammer_808_anthem',
    name: 'Bama Slammer Signature 808',
    producer: 'Alabama Slammer & Metro South',
    bpm: 142,
    key: 'F Minor',
    genre: 'Southern Rap',
    tags: ['Heavy 808', 'Dirty South', 'Brass Stabs', 'Anthem'],
    synthPattern: 'slammer_trap',
  },
  {
    id: 'trap_heat_banger',
    name: 'Dixie Trunk Shaker',
    producer: 'Subwoofer Kid',
    bpm: 138,
    key: 'C Minor',
    genre: 'Trap',
    tags: ['Hi-Hat Rolls', 'Hard Kick', 'Dark Synths'],
    synthPattern: 'trap_heat',
  },
  {
    id: 'rnb_velvet_chords',
    name: 'Midnight Velvet Slow Jam',
    producer: 'Neo Soul Beats',
    bpm: 96,
    key: 'Eb Major',
    genre: 'R&B / Soul',
    tags: ['Lush Rhodes', 'Smooth Bass', 'Warm Kick'],
    synthPattern: 'rnb_soul',
  },
  {
    id: 'drill_808_slide',
    name: 'Urban Phantom Drill',
    producer: 'Ghost 700',
    bpm: 144,
    key: 'D Minor',
    genre: 'Drill',
    tags: ['Sliding 808', 'Fast Snare', 'Grimy Melody'],
    synthPattern: 'drill',
  },
  {
    id: 'boombap_golden_era',
    name: '90s Vinyl Cypher',
    producer: 'Crate Digger Pete',
    bpm: 92,
    key: 'A Minor',
    genre: 'Hip Hop',
    tags: ['Punchy Snare', 'Upright Bass', 'Scratch FX'],
    synthPattern: 'boombap',
  },
];

export const INITIAL_BLOCKED_ARTISTS: BlockedArtist[] = [
  {
    id: 'blk_01',
    artistName: 'CopyCat Bot 9000',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    blockedAt: '2026-08-10',
    reason: 'Spamming low-effort audio in Listen 4 Listen pool',
  },
];

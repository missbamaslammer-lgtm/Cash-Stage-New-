import React, { useState } from 'react';
import { 
  INITIAL_TRACKS, 
  INITIAL_BATTLES, 
  INITIAL_CREWS, 
  INITIAL_L4L_TRACKS, 
  INITIAL_USER, 
  INITIAL_BLOCKED_ARTISTS,
  INITIAL_DAILY_MISSION_STATE,
  INITIAL_CONTESTS,
  INITIAL_DJ_RADIO_SLOTS,
  INITIAL_CALL_TO_BATTLE_CHATS,
  BAMA_BASEBALL_CARD,
  TROY_BASEBALL_CARD,
  SIREN_BASEBALL_CARD,
  GHOST_BASEBALL_CARD
} from './data/initialData';
import { 
  Track, 
  BattleMatch, 
  Crew, 
  L4LTrack, 
  UserProfile, 
  BlockedArtist, 
  DailyMissionState,
  Contest,
  DjRadioSlot,
  CallToBattleMessage,
  StoreItem,
  BattleBaseballCard as CardType
} from './types';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { ListenNowView } from './components/ListenNowView';
import { RecordingStudioView } from './components/RecordingStudioView';
import { AnonymousVotingView } from './components/AnonymousVotingView';
import { Listen4ListenView } from './components/Listen4ListenView';
import { CrewsView } from './components/CrewsView';
import { ContestsView } from './components/ContestsView';
import { CallToBattleChat } from './components/CallToBattleChat';
import { BlockedArtistsModal } from './components/BlockedArtistsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { DailyRankingsModal } from './components/DailyRankingsModal';
import { CashStageStoreModal } from './components/CashStageStoreModal';
import { LiveRadioFeedModal } from './components/LiveRadioFeedModal';
import { audioEngine } from './services/audioService';

export default function App() {
  // Navigation: 'listen_now' | 'call_to_battle' | 'anonymous_voting' | 'recording_studio' | 'listen_4_listen' | 'crews' | 'contests'
  const [activeTab, setActiveTab] = useState<string>('listen_now');

  // Application Data States
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [battles, setBattles] = useState<BattleMatch[]>(INITIAL_BATTLES);
  const [crews, setCrews] = useState<Crew[]>(INITIAL_CREWS);
  const [l4lPool, setL4lPool] = useState<L4LTrack[]>(INITIAL_L4L_TRACKS);
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [radioSlots, setRadioSlots] = useState<DjRadioSlot[]>(INITIAL_DJ_RADIO_SLOTS);
  const [chatMessages, setChatMessages] = useState<CallToBattleMessage[]>(INITIAL_CALL_TO_BATTLE_CHATS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [blockedArtists, setBlockedArtists] = useState<BlockedArtist[]>(INITIAL_BLOCKED_ARTISTS);
  const [missionState, setMissionState] = useState<DailyMissionState>(INITIAL_DAILY_MISSION_STATE);

  // Modals
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isRankingsModalOpen, setIsRankingsModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);

  // Filter out blocked artist tracks
  const visibleTracks = tracks.filter((t) =>
    !blockedArtists.some((b) => b.artistName.toLowerCase() === t.artist.toLowerCase())
  );

  // Track User Activity across platform
  const trackUserActivity = (
    category: 'listening' | 'voting' | 'recording' | 'tipping' | 'l4l' | 'social',
    amount: number = 1
  ) => {
    setMissionState((prev) => {
      let updated = false;
      const newMissions = prev.missions.map((m) => {
        if (m.category === category && !m.isCompleted) {
          const newProgress = Math.min(m.targetProgress, m.currentProgress + amount);
          const isDone = newProgress >= m.targetProgress;
          if (isDone && !m.isCompleted) {
            audioEngine.playCashSound();
          }
          updated = true;
          return {
            ...m,
            currentProgress: newProgress,
            isCompleted: isDone,
          };
        }
        return m;
      });

      if (!updated) return prev;
      return {
        ...prev,
        missions: newMissions,
      };
    });
  };

  // Claim Mission Reward
  const handleClaimMissionReward = (missionId: string) => {
    const mission = missionState.missions.find((m) => m.id === missionId);
    if (!mission || !mission.isCompleted || mission.isClaimed) return;

    setMissionState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, isClaimed: true } : m
      ),
    }));

    setUser((prev) => ({
      ...prev,
      stagePoints: prev.stagePoints + mission.rewardPoints,
      cashBalance: prev.cashBalance + (mission.rewardCash || 0),
      listenCredits: prev.listenCredits + (mission.rewardCredits || 0),
    }));
  };

  // Claim Grand Chest
  const handleClaimGrandChest = () => {
    if (missionState.bonusGrandChestClaimed) return;

    setMissionState((prev) => ({
      ...prev,
      bonusGrandChestClaimed: true,
      streakDays: prev.streakDays + 1,
    }));

    setUser((prev) => ({
      ...prev,
      stagePoints: prev.stagePoints + missionState.grandChestBonusPoints,
      cashBalance: prev.cashBalance + missionState.grandChestBonusCash,
    }));
  };

  // Audio Playback Handlers
  const handlePlayTrack = (track: Track) => {
    trackUserActivity('listening', 1);

    // Increment track plays and views
    setTracks((prev) =>
      prev.map((t) =>
        t.id === track.id
          ? { ...t, plays: t.plays + 1, views: t.views + 1 }
          : t
      )
    );

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioEngine.stopBeat();
        setIsPlaying(false);
      } else {
        audioEngine.startBeat(track.beatType, track.bpm);
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      audioEngine.startBeat(track.beatType, track.bpm);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioEngine.stopBeat();
      setIsPlaying(false);
    } else {
      audioEngine.startBeat(currentTrack.beatType, currentTrack.bpm);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack || visibleTracks.length === 0) return;
    const currentIndex = visibleTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % visibleTracks.length;
    const nextTrack = visibleTracks[nextIndex];
    setCurrentTrack(nextTrack);
    if (isPlaying) {
      audioEngine.startBeat(nextTrack.beatType, nextTrack.bpm);
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack || visibleTracks.length === 0) return;
    const currentIndex = visibleTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + visibleTracks.length) % visibleTracks.length;
    const prevTrack = visibleTracks[prevIndex];
    setCurrentTrack(prevTrack);
    if (isPlaying) {
      audioEngine.startBeat(prevTrack.beatType, prevTrack.bpm);
    }
  };

  // Throw Cash / Tip Handler
  const handleThrowCash = (amount: number, track: Track) => {
    trackUserActivity('tipping', 1);

    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, cashEarned: t.cashEarned + amount } : t))
    );
    setUser((prev) => ({
      ...prev,
      cashBalance: prev.cashBalance + (track.artist === user.name ? amount : -amount),
      stagePoints: prev.stagePoints + amount * 5,
    }));
  };

  // Block Artist Action (Enforces: cannot vote on or see blocker's stuff)
  const handleBlockArtist = (artistName: string, avatar?: string) => {
    if (blockedArtists.some((b) => b.artistName.toLowerCase() === artistName.toLowerCase())) {
      alert(`${artistName} is already in your blocked list.`);
      return;
    }

    const newBlocked: BlockedArtist = {
      id: `blk_${Date.now()}`,
      artistName,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      blockedAt: new Date().toISOString().split('T')[0],
      reason: 'Blocked from viewing and voting on content',
    };

    setBlockedArtists((prev) => [newBlocked, ...prev]);

    if (currentTrack?.artist.toLowerCase() === artistName.toLowerCase()) {
      handleNextTrack();
    }

    alert(`🚫 ${artistName} has been blocked. They cannot vote on or see your tracks.`);
  };

  const handleUnblockArtist = (id: string) => {
    setBlockedArtists((prev) => prev.filter((b) => b.id !== id));
  };

  // Publish from Recording Studio (DAW)
  const handlePublishTrack = (newTrack: Track) => {
    trackUserActivity('recording', 1);

    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrack(newTrack);
    setUser((prev) => ({
      ...prev,
      tracksCount: prev.tracksCount + 1,
      cashBalance: prev.cashBalance + 50.00,
      stagePoints: prev.stagePoints + 200,
    }));
    setActiveTab('listen_now');
  };

  // Anonymous Voting Callback
  const handleCastVote = (battleId: string, choice: 'A' | 'B') => {
    trackUserActivity('voting', 1);

    setBattles((prev) =>
      prev.map((b) => {
        if (b.id !== battleId) return b;
        return {
          ...b,
          userVoted: choice,
          trackA: {
            ...b.trackA,
            votes: b.trackA.votes + (choice === 'A' ? 1 : 0),
          },
          trackB: {
            ...b.trackB,
            votes: b.trackB.votes + (choice === 'B' ? 1 : 0),
          },
        };
      })
    );

    setUser((prev) => ({
      ...prev,
      stagePoints: prev.stagePoints + 50,
      stageCoins: prev.stageCoins + 25,
      listenCredits: prev.listenCredits + 10,
    }));
  };

  // Listen 4 Listen Complete
  const handleCompleteL4L = (
    l4lId: string,
    creditsEarned: number,
    feedback: { rating: number; comment: string }
  ) => {
    trackUserActivity('tipping', 1);
    trackUserActivity('listening', 1);

    setL4lPool((prev) =>
      prev.map((item) => {
        if (item.id !== l4lId) return item;
        return {
          ...item,
          listensCompleted: item.listensCompleted + 1,
          feedbackGiven: [
            {
              reviewerName: user.name,
              rating: feedback.rating,
              comment: feedback.comment,
              timestamp: 'Just now',
            },
            ...item.feedbackGiven,
          ],
        };
      })
    );

    setUser((prev) => ({
      ...prev,
      listenCredits: prev.listenCredits + creditsEarned,
      stagePoints: prev.stagePoints + 25,
    }));
  };

  // Crews Handlers
  const handleCreateCrew = (newCrew: Crew) => {
    setCrews((prev) => [newCrew, ...prev]);
    setUser((prev) => ({
      ...prev,
      crewId: newCrew.id,
      crewName: newCrew.name,
      stagePoints: prev.stagePoints + 300,
    }));
  };

  const handleJoinCrew = (crewId: string) => {
    const targetCrew = crews.find((c) => c.id === crewId);
    if (!targetCrew) return;

    if (user.stagePoints < targetCrew.minPointsToJoin) {
      alert(`You need at least ${targetCrew.minPointsToJoin} Stage Points to join ${targetCrew.name}.`);
      return;
    }

    setCrews((prev) =>
      prev.map((c) => (c.id === crewId ? { ...c, membersCount: c.membersCount + 1 } : c))
    );
    setUser((prev) => ({
      ...prev,
      crewId: targetCrew.id,
      crewName: targetCrew.name,
    }));
    alert(`🎉 You have officially joined ${targetCrew.name}!`);
  };

  // Contests Entry Handler
  const handleEnterContest = (contestId: string) => {
    const contest = contests.find((c) => c.id === contestId);
    if (!contest) return;

    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? { ...c, totalEntries: c.totalEntries + 1, userEntered: true }
          : c
      )
    );

    setUser((prev) => ({
      ...prev,
      cashBalance: Math.max(0, prev.cashBalance - contest.entryFeeBucks),
      stagePoints: prev.stagePoints + 150,
    }));
  };

  // Call To Battle Chat Handlers
  const handleSendMessage = (
    text: string,
    isChallenge: boolean,
    challengeDetails?: CallToBattleMessage['challengeDetails']
  ) => {
    const newMsg: CallToBattleMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'usr_me',
      senderName: user.name,
      senderAvatar: user.avatar,
      senderCrew: user.crewName || 'Independent',
      senderCard: user.baseballCard,
      text,
      timestamp: 'Just now',
      isBattleChallenge: isChallenge,
      challengeDetails,
    };

    setChatMessages((prev) => [newMsg, ...prev]);
    trackUserActivity('social', 1);
  };

  const handleAcceptChallenge = (message: CallToBattleMessage) => {
    audioEngine.playBattleBell();
    alert(`⚔️ Challenge accepted against ${message.senderName}! Match countdown initialized for 48 Hours.`);
    setActiveTab('anonymous_voting');
  };

  const handleChallengeCard = (card: CardType) => {
    audioEngine.playBattleBell();
    setActiveTab('call_to_battle');
    handleSendMessage(`Official Battle Challenge issued against ${card.artistName}! 3-Minute Limit, $100 Cash Pot.`, true, {
      potAmount: 100,
      isBlind: true,
      isLiveAudio: true,
      isLiveVideo: false,
      stakeType: 'bucks',
      beatName: card.trackTitle,
    });
  };

  // Radio DJ Slot Booking
  const handleBookRadioSlot = (
    slotId: string,
    details: { djName: string; setTitle: string; genre: string }
  ) => {
    setRadioSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              isBooked: true,
              djName: details.djName,
              setTitle: details.setTitle,
              genre: details.genre,
            }
          : slot
      )
    );

    setUser((prev) => ({
      ...prev,
      cashBalance: Math.max(0, prev.cashBalance - 10.00),
      stagePoints: prev.stagePoints + 200,
    }));
  };

  // Store Purchases Handler
  const handlePurchaseStoreItem = (item: StoreItem, paymentMethod: 'bucks' | 'coins') => {
    if (paymentMethod === 'bucks') {
      setUser((prev) => ({
        ...prev,
        cashBalance: Math.max(0, prev.cashBalance - item.priceUsd),
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        stageCoins: Math.max(0, prev.stageCoins - item.priceCoins),
      }));
    }

    if (item.type === 'live_feed_spotlight') {
      // Pin current user track to spotlight
      setTracks((prev) =>
        prev.map((t, idx) =>
          idx === 0 ? { ...t, isPinnedSpotlight: true } : { ...t, isPinnedSpotlight: false }
        )
      );
      alert('✨ Your track is now pinned on top of the Live Feed for the length of the song!');
    } else if (item.type === 'extra_solo_drop' || item.type === 'extra_battle_drop') {
      setActiveTab('recording_studio');
    } else if (item.type === 'dj_radio_rsvp') {
      setIsStoreModalOpen(false);
      setIsRadioModalOpen(true);
    }
  };

  const handleBuyCoins = (amount: number, priceUsd: number) => {
    setUser((prev) => ({
      ...prev,
      stageCoins: prev.stageCoins + amount,
      cashBalance: Math.max(0, prev.cashBalance - priceUsd),
    }));
  };

  // Deposit/Withdraw Cash in Wallet
  const handleAddCash = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      cashBalance: Math.max(0, prev.cashBalance + amount),
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950 font-sans flex flex-col">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenBlockedModal={() => setIsBlockedModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenMissionsModal={() => setIsMissionsModalOpen(true)}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenRadioModal={() => setIsRadioModalOpen(true)}
        onOpenRankingsModal={() => setIsRankingsModalOpen(true)}
        missionState={missionState}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        
        {/* 1. Listen Now Feed */}
        {activeTab === 'listen_now' && (
          <ListenNowView
            tracks={visibleTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onThrowCash={handleThrowCash}
            onBlockArtist={handleBlockArtist}
            onOpenStudio={() => setActiveTab('recording_studio')}
            blockedArtists={blockedArtists}
            missionState={missionState}
            onOpenMissionsModal={() => setIsMissionsModalOpen(true)}
            onClaimReward={handleClaimMissionReward}
            onNavigateToMission={(tab) => setActiveTab(tab)}
            onOpenStoreModal={() => setIsStoreModalOpen(true)}
          />
        )}

        {/* 2. Call To Battle Chat Lobby */}
        {activeTab === 'call_to_battle' && (
          <CallToBattleChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onAcceptChallenge={handleAcceptChallenge}
            user={user}
            onChallengeCard={handleChallengeCard}
          />
        )}

        {/* 3. Recording Studio DAW (Voloco / BandLab styled) */}
        {activeTab === 'recording_studio' && (
          <RecordingStudioView onPublishTrack={handlePublishTrack} />
        )}

        {/* 4. Anonymous Voting Finals (7 PM EST posts) */}
        {activeTab === 'anonymous_voting' && (
          <AnonymousVotingView
            battles={battles}
            onCastVote={handleCastVote}
            blockedArtists={blockedArtists}
          />
        )}

        {/* 5. Listen 4 Listen Review Hub */}
        {activeTab === 'listen_4_listen' && (
          <Listen4ListenView
            l4lPool={l4lPool}
            user={user}
            onCompleteL4L={handleCompleteL4L}
            onSubmitToPool={(track, credits) => {
              setUser((prev) => ({ ...prev, listenCredits: Math.max(0, prev.listenCredits - credits) }));
              const newL4L: L4LTrack = {
                id: `l4l_${Date.now()}`,
                track,
                requestedBy: user.name,
                creditsOffered: credits,
                listensRequired: 20,
                listensCompleted: 0,
                feedbackGiven: [],
              };
              setL4lPool((prev) => [newL4L, ...prev]);
            }}
          />
        )}

        {/* 6. Crews & Squads */}
        {activeTab === 'crews' && (
          <CrewsView
            crews={crews}
            user={user}
            onCreateCrew={handleCreateCrew}
            onJoinCrew={handleJoinCrew}
          />
        )}

        {/* 7. Contests & Sanctioned Tournaments */}
        {activeTab === 'contests' && (
          <ContestsView
            contests={contests}
            user={user}
            onEnterContest={handleEnterContest}
            onOpenStudio={() => setActiveTab('recording_studio')}
          />
        )}
      </main>

      {/* Persistent Player & FX Footer Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onThrowCash={handleThrowCash}
        onBlockArtist={handleBlockArtist}
      />

      {/* Blocked Artists Management Modal */}
      <BlockedArtistsModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        blockedArtists={blockedArtists}
        onUnblockArtist={handleUnblockArtist}
        onBlockNewArtist={(name, reason) => {
          const newB: BlockedArtist = {
            id: `blk_${Date.now()}`,
            artistName: name,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            blockedAt: new Date().toISOString().split('T')[0],
            reason,
          };
          setBlockedArtists((prev) => [newB, ...prev]);
        }}
      />

      {/* User Profile & Wallet Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        userTracks={tracks.filter((t) => t.artist === user.name)}
        onAddCash={handleAddCash}
      />

      {/* Daily Missions & Stage Quests Modal */}
      <DailyMissionsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
        missionState={missionState}
        onClaimReward={handleClaimMissionReward}
        onClaimGrandChest={handleClaimGrandChest}
        onNavigateToMission={(tab) => {
          setIsMissionsModalOpen(false);
          setActiveTab(tab);
        }}
      />

      {/* Daily Rankings Leaderboards Modal (7pm, 9pm, 11pm EST) */}
      <DailyRankingsModal
        isOpen={isRankingsModalOpen}
        onClose={() => setIsRankingsModalOpen(false)}
      />

      {/* Cash Stage Official Store Modal (Bucks & Coins) */}
      <CashStageStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        user={user}
        onPurchaseItem={handlePurchaseStoreItem}
        onBuyCoins={handleBuyCoins}
      />

      {/* 24/7 Live Radio & DJ RSVP Modal ($10 / 30 Min) */}
      <LiveRadioFeedModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
        slots={radioSlots}
        onBookSlot={handleBookRadioSlot}
        user={user}
      />
    </div>
  );
}

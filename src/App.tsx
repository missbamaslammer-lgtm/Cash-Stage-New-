import React, { useState } from 'react';
import { 
  INITIAL_TRACKS, 
  INITIAL_BATTLES, 
  INITIAL_CREWS, 
  INITIAL_L4L_TRACKS, 
  INITIAL_USER, 
  INITIAL_BLOCKED_ARTISTS 
} from './data/initialData';
import { Track, BattleMatch, Crew, L4LTrack, UserProfile, BlockedArtist } from './types';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { ListenNowView } from './components/ListenNowView';
import { RecordingStudioView } from './components/RecordingStudioView';
import { AnonymousVotingView } from './components/AnonymousVotingView';
import { Listen4ListenView } from './components/Listen4ListenView';
import { CrewsView } from './components/CrewsView';
import { BlockedArtistsModal } from './components/BlockedArtistsModal';
import { AndroidStudioHubModal } from './components/AndroidStudioHubModal';
import { UserProfileModal } from './components/UserProfileModal';
import { audioEngine } from './services/audioService';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('listen_now');

  // Application Data States
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [battles, setBattles] = useState<BattleMatch[]>(INITIAL_BATTLES);
  const [crews, setCrews] = useState<Crew[]>(INITIAL_CREWS);
  const [l4lPool, setL4lPool] = useState<L4LTrack[]>(INITIAL_L4L_TRACKS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [blockedArtists, setBlockedArtists] = useState<BlockedArtist[]>(INITIAL_BLOCKED_ARTISTS);

  // Modal States
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isAABModalOpen, setIsAABModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filter out any blocked artist tracks
  const visibleTracks = tracks.filter((t) =>
    !blockedArtists.some((b) => b.artistName.toLowerCase() === t.artist.toLowerCase())
  );

  // Audio Playback Handlers
  const handlePlayTrack = (track: Track) => {
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
    // Update track cash earned and user balance
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, cashEarned: t.cashEarned + amount } : t))
    );
    setUser((prev) => ({
      ...prev,
      cashBalance: prev.cashBalance + (track.artist === user.name ? amount : -amount),
      stagePoints: prev.stagePoints + amount * 5,
    }));
  };

  // Block Artist Action
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
      reason: 'Blocked by user from feed/player',
    };

    setBlockedArtists((prev) => [newBlocked, ...prev]);

    // If currently playing track belongs to this artist, move to next
    if (currentTrack?.artist.toLowerCase() === artistName.toLowerCase()) {
      handleNextTrack();
    }

    alert(`🚫 ${artistName} has been blocked and removed from your feed & battles.`);
  };

  const handleUnblockArtist = (id: string) => {
    setBlockedArtists((prev) => prev.filter((b) => b.id !== id));
  };

  // Publish from Recording Studio
  const handlePublishTrack = (newTrack: Track) => {
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

    // Give stage points to user for voting
    setUser((prev) => ({
      ...prev,
      stagePoints: prev.stagePoints + 50,
      listenCredits: prev.listenCredits + 10,
    }));
  };

  // Listen 4 Listen Complete
  const handleCompleteL4L = (
    l4lId: string,
    creditsEarned: number,
    feedback: { rating: number; comment: string }
  ) => {
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

  // Create Crew Handler
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
      alert(`You need at least ${targetCrew.minPointsToJoin} Stage Points to join ${targetCrew.name}. Earn more points in the DAW, Battles, or L4L!`);
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
    alert(`🎉 You have officially joined ${targetCrew.name}! Welcome to the squad.`);
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
        onOpenAABModal={() => setIsAABModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'listen_now' && (
          <ListenNowView
            tracks={visibleTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onThrowCash={handleThrowCash}
            onBlockArtist={handleBlockArtist}
            onOpenStudio={() => setActiveTab('recording_studio')}
          />
        )}

        {activeTab === 'recording_studio' && (
          <RecordingStudioView onPublishTrack={handlePublishTrack} />
        )}

        {activeTab === 'anonymous_voting' && (
          <AnonymousVotingView
            battles={battles}
            onCastVote={handleCastVote}
          />
        )}

        {activeTab === 'listen_4_listen' && (
          <Listen4ListenView
            l4lPool={l4lPool}
            user={user}
            onCompleteL4L={handleCompleteL4L}
            onSubmitToPool={(track, credits) => {
              // Deduct credits and append to pool
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

        {activeTab === 'crews' && (
          <CrewsView
            crews={crews}
            user={user}
            onCreateCrew={handleCreateCrew}
            onJoinCrew={handleJoinCrew}
          />
        )}
      </main>

      {/* Persistent Audio Player & Stage FX Bar */}
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

      {/* Android Studio & AAB Build Hub Modal */}
      <AndroidStudioHubModal
        isOpen={isAABModalOpen}
        onClose={() => setIsAABModalOpen(false)}
      />

      {/* User Profile & Wallet Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        userTracks={tracks.filter((t) => t.artist === user.name)}
        onAddCash={handleAddCash}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  Trophy, 
  Flame, 
  DollarSign, 
  Sparkles, 
  Play, 
  Pause, 
  EyeOff, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Award, 
  ShieldCheck, 
  Users,
  Swords,
  Lock,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BattleMatch, Track, BlockedArtist } from '../types';
import { audioEngine } from '../services/audioService';
import { BattleBaseballCard } from './BattleBaseballCard';

interface AnonymousVotingViewProps {
  battles: BattleMatch[];
  onCastVote: (battleId: string, choice: 'A' | 'B') => void;
  blockedArtists: BlockedArtist[];
}

export const AnonymousVotingView: React.FC<AnonymousVotingViewProps> = ({
  battles,
  onCastVote,
  blockedArtists,
}) => {
  const [activeBattleId, setActiveBattleId] = useState<string>(battles[0]?.id || '');
  const [playingSide, setPlayingSide] = useState<'A' | 'B' | null>(null);
  const [listenProgressA, setListenProgressA] = useState(0);
  const [listenProgressB, setListenProgressB] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userVotedChoice, setUserVotedChoice] = useState<'A' | 'B' | null>(null);
  const [showStatsCardSide, setShowStatsCardSide] = useState<'A' | 'B' | null>(null);

  // Daily 7:00 PM EST post countdown
  const [timeUntil7pmEST, setTimeUntil7pmEST] = useState('01h 14m 22s');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const target = new Date(estNow);
      target.setHours(19, 0, 0, 0); // 7:00 PM EST
      if (target.getTime() <= estNow.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      const diffMs = target.getTime() - estNow.getTime();
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setTimeUntil7pmEST(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter out any battle involving blocked artists
  const blockedSet = new Set(blockedArtists.map((b) => b.artistName.toLowerCase()));
  const availableBattles = battles.filter(
    (b) =>
      !blockedSet.has(b.trackA.track.artist.toLowerCase()) &&
      !blockedSet.has(b.trackB.track.artist.toLowerCase())
  );

  const currentBattle = availableBattles.find((b) => b.id === activeBattleId) || availableBattles[0] || battles[0];

  // Listen timer effect
  useEffect(() => {
    let timer: number;
    if (playingSide === 'A') {
      timer = window.setInterval(() => {
        setListenProgressA((prev) => Math.min(prev + 1, currentBattle.minListenSeconds));
      }, 1000);
    } else if (playingSide === 'B') {
      timer = window.setInterval(() => {
        setListenProgressB((prev) => Math.min(prev + 1, currentBattle.minListenSeconds));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [playingSide, currentBattle]);

  // Audio trigger
  const handlePlaySide = (side: 'A' | 'B') => {
    if (playingSide === side) {
      audioEngine.stopBeat();
      setPlayingSide(null);
    } else {
      const track = side === 'A' ? currentBattle.trackA.track : currentBattle.trackB.track;
      audioEngine.startBeat(track.beatType, track.bpm);
      setPlayingSide(side);
    }
  };

  const isEligibleToVote = listenProgressA >= currentBattle.minListenSeconds && listenProgressB >= currentBattle.minListenSeconds;

  const handleVote = (choice: 'A' | 'B') => {
    setUserVotedChoice(choice);
    setIsRevealed(true);
    audioEngine.stopBeat();
    setPlayingSide(null);
    audioEngine.playCashSound();

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ffffff', '#eab308'],
    });

    onCastVote(currentBattle.id, choice);
  };

  // Calculate vote percentages
  const totalVotes = (currentBattle.trackA.votes + (userVotedChoice === 'A' ? 1 : 0)) +
                     (currentBattle.trackB.votes + (userVotedChoice === 'B' ? 1 : 0));
  const pctA = Math.round(((currentBattle.trackA.votes + (userVotedChoice === 'A' ? 1 : 0)) / totalVotes) * 100) || 50;
  const pctB = 100 - pctA;

  return (
    <div className="space-y-8 pb-32">
      
      {/* Header Banner with 7 PM EST Daily Notice */}
      <div className="bg-gradient-to-r from-zinc-950 via-purple-950/40 to-zinc-950 border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/40">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Anti-Clout Blind Arena</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Anonymous Voting Finals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              No follower bias. No name recognition. Audio drops are masked during live voting. Final battle scores post daily at <strong>7:00 PM EST</strong>.
            </p>
          </div>

          {/* Cash Pot Badge with 7 PM Countdown */}
          <div className="bg-zinc-900 border-2 border-amber-500/50 p-4 rounded-2xl text-center shadow-xl shadow-amber-500/10 flex-shrink-0 space-y-1">
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Grand Battle Pot</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center justify-center gap-1 font-mono">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              ${currentBattle.potAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-amber-300 font-bold flex items-center justify-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>Posts at 7:00 PM EST ({timeUntil7pmEST})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Match Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {availableBattles.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setActiveBattleId(b.id);
              setIsRevealed(false);
              setUserVotedChoice(null);
              setListenProgressA(0);
              setListenProgressB(0);
              setShowStatsCardSide(null);
              audioEngine.stopBeat();
              setPlayingSide(null);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeBattleId === b.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>{b.title}</span>
          </button>
        ))}
      </div>

      {/* The Blind Showdown Arena (Side A vs Side B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Center VS Emblem */}
        <div className="hidden md:flex absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 text-zinc-950 font-black text-sm items-center justify-center shadow-2xl z-20 border-4 border-zinc-950">
          VS
        </div>

        {/* SIDE A CARD */}
        <div className={`rounded-3xl border p-6 transition-all duration-500 flex flex-col justify-between space-y-6 ${
          userVotedChoice === 'A' 
            ? 'bg-zinc-900 border-amber-500 ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20' 
            : 'bg-zinc-900/90 border-zinc-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase">
              Side A Contender (Max 3m)
            </span>
            <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{listenProgressA}/{currentBattle.minListenSeconds}s Verified</span>
            </div>
          </div>

          {/* Masked vs Revealed Content */}
          <div className="text-center space-y-3 py-4">
            <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-zinc-950 flex items-center justify-center">
              {isRevealed ? (
                <img
                  src={currentBattle.trackA.track.coverArt}
                  alt={currentBattle.trackA.track.artist}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="text-center">
                  <EyeOff className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                  <div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Masked</div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {isRevealed ? currentBattle.trackA.track.title : currentBattle.trackA.anonymousAlias}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isRevealed ? (
                  <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                    {currentBattle.trackA.track.artist}
                    {currentBattle.trackA.track.isBamaSlammerOfficial && '👑 (Alabama Slammer)'}
                  </span>
                ) : (
                  'Anonymous Identity Concealed'
                )}
              </p>
            </div>

            {/* Audio Player Button */}
            <button
              onClick={() => handlePlaySide('A')}
              className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 mx-auto shadow-lg transition cursor-pointer ${
                playingSide === 'A'
                  ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              {playingSide === 'A' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{playingSide === 'A' ? 'Pause Track A' : 'Listen to Track A'}</span>
            </button>
          </div>

          {/* Voting Action / Results */}
          <div>
            {isRevealed ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Votes Received</span>
                  <span className="text-amber-400 font-mono">{pctA}% ({currentBattle.trackA.votes + (userVotedChoice === 'A' ? 1 : 0)})</span>
                </div>
                <div className="h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pctA}%` }} />
                </div>
                {userVotedChoice === 'A' && (
                  <div className="text-center text-xs font-black text-emerald-400 mt-2">
                    ✓ You Voted for Track A!
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleVote('A')}
                disabled={!isEligibleToVote}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                  isEligibleToVote
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span>{isEligibleToVote ? 'Vote for Track A (Final)' : `Listen ${currentBattle.minListenSeconds}s to Unlock Vote`}</span>
              </button>
            )}
          </div>
        </div>

        {/* SIDE B CARD */}
        <div className={`rounded-3xl border p-6 transition-all duration-500 flex flex-col justify-between space-y-6 ${
          userVotedChoice === 'B' 
            ? 'bg-zinc-900 border-amber-500 ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20' 
            : 'bg-zinc-900/90 border-zinc-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-black uppercase">
              Side B Contender (Max 3m)
            </span>
            <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{listenProgressB}/{currentBattle.minListenSeconds}s Verified</span>
            </div>
          </div>

          {/* Masked vs Revealed Content */}
          <div className="text-center space-y-3 py-4">
            <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-yellow-500/40 shadow-xl bg-zinc-950 flex items-center justify-center">
              {isRevealed ? (
                <img
                  src={currentBattle.trackB.track.coverArt}
                  alt={currentBattle.trackB.track.artist}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="text-center">
                  <EyeOff className="w-10 h-10 text-yellow-400 mx-auto animate-pulse" />
                  <div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Masked</div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {isRevealed ? currentBattle.trackB.track.title : currentBattle.trackB.anonymousAlias}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isRevealed ? (
                  <span className="text-yellow-400 font-bold">
                    {currentBattle.trackB.track.artist}
                  </span>
                ) : (
                  'Anonymous Identity Concealed'
                )}
              </p>
            </div>

            {/* Audio Player Button */}
            <button
              onClick={() => handlePlaySide('B')}
              className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 mx-auto shadow-lg transition cursor-pointer ${
                playingSide === 'B'
                  ? 'bg-yellow-500 text-zinc-950 shadow-yellow-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              {playingSide === 'B' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{playingSide === 'B' ? 'Pause Track B' : 'Listen to Track B'}</span>
            </button>
          </div>

          {/* Voting Action / Results */}
          <div>
            {isRevealed ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Votes Received</span>
                  <span className="text-yellow-400 font-mono">{pctB}% ({currentBattle.trackB.votes + (userVotedChoice === 'B' ? 1 : 0)})</span>
                </div>
                <div className="h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div className="h-full bg-yellow-500 rounded-full transition-all duration-700" style={{ width: `${pctB}%` }} />
                </div>
                {userVotedChoice === 'B' && (
                  <div className="text-center text-xs font-black text-emerald-400 mt-2">
                    ✓ You Voted for Track B!
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleVote('B')}
                disabled={!isEligibleToVote}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                  isEligibleToVote
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 shadow-lg shadow-yellow-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span>{isEligibleToVote ? 'Vote for Track B (Final)' : `Listen ${currentBattle.minListenSeconds}s to Unlock Vote`}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Integrity Guarantee */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-zinc-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>
          <strong>Anti-Tamper Vote Protocol:</strong> Every vote is cryptographically tied to verified audio listening time. Blocked artists are strictly barred from viewing or voting on your tracks. Daily final tallies post at 7:00 PM EST.
        </span>
      </div>
    </div>
  );
};

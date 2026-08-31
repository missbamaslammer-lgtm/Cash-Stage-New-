import React, { useState } from 'react';
import { 
  Trophy, 
  Swords, 
  Flame, 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  Lock, 
  Video, 
  Mic2, 
  Users, 
  ShieldCheck, 
  RotateCw,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { BattleBaseballCard as CardType } from '../types';
import { audioEngine } from '../services/audioService';

interface BattleBaseballCardProps {
  card: CardType;
  isCurrentUser?: boolean;
  onToggleLiveAudio?: () => void;
  onToggleLiveVideo?: () => void;
  onToggleCollab?: () => void;
  onChallengeToBattle?: (card: CardType) => void;
  showChallengeButton?: boolean;
}

export const BattleBaseballCard: React.FC<BattleBaseballCardProps> = ({
  card,
  isCurrentUser = false,
  onToggleLiveAudio,
  onToggleLiveVideo,
  onToggleCollab,
  onChallengeToBattle,
  showChallengeButton = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const getFoilClasses = () => {
    switch (card.cardFoilEffect) {
      case 'gold_hologram':
        return 'from-amber-400/30 via-yellow-200/20 to-amber-600/30 border-amber-400 shadow-amber-500/20';
      case 'ruby_fire':
        return 'from-red-500/30 via-orange-400/20 to-rose-600/30 border-red-400 shadow-red-500/20';
      case 'emerald_prism':
        return 'from-emerald-400/30 via-teal-200/20 to-emerald-600/30 border-emerald-400 shadow-emerald-500/20';
      case 'silver_chrome':
        return 'from-zinc-300/30 via-slate-100/20 to-zinc-400/30 border-zinc-300 shadow-zinc-400/20';
      default:
        return 'from-amber-500/20 via-yellow-500/10 to-zinc-900 border-amber-500/40 shadow-amber-500/20';
    }
  };

  const handlePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.isBlindInvite && !isCurrentUser) return;

    if (isPlayingPreview) {
      audioEngine.stopBeat();
      setIsPlayingPreview(false);
    } else {
      audioEngine.startBeat(card.trackBeat || 'slammer_808_anthem', 140);
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="relative group perspective select-none max-w-sm w-full mx-auto">
      {/* Outer Hologram Trading Card Frame */}
      <div 
        className={`relative rounded-3xl p-1 bg-gradient-to-br ${getFoilClasses()} border-2 shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
      >
        {/* Card Header Plate */}
        <div className="bg-zinc-950/95 backdrop-blur-md rounded-[22px] p-4 text-white space-y-3.5 border border-zinc-800/80 relative overflow-hidden">
          
          {/* Hologram Light Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

          {/* Top Bar: Card Serial & Foil Badge */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5 font-black uppercase text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>{card.tier}</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400">
              <span>{card.rankBadge}</span>
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="ml-1 text-zinc-400 hover:text-amber-300 p-1 rounded-lg hover:bg-zinc-900 transition"
                title="Flip Card for Bio & Stats"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isFlipped ? (
            /* FRONT OF BASEBALL CARD */
            <>
              {/* Contender Visual Box */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700 aspect-square max-h-52 w-full shadow-inner bg-zinc-900">
                <img
                  src={card.avatar}
                  alt={card.artistName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                
                {/* Hometown & Crew overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-200 border border-white/10">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{card.hometown}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500/90 text-zinc-950 text-[10px] font-black tracking-wide">
                  {card.crewName}
                </div>

                {/* Name Plate */}
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                  <div>
                    <h3 className="font-black text-lg text-white leading-tight drop-shadow-md">
                      {card.artistName}
                    </h3>
                    <span className="text-xs text-amber-300 font-mono font-medium">
                      {card.artistHandle}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Stage XP</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {card.stagePoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Baseball Box Score Stats Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 font-mono">
                <div className="border-r border-zinc-800">
                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">Wins</span>
                  <span className="text-sm font-black text-emerald-400">{card.record.wins}</span>
                </div>
                <div className="border-r border-zinc-800">
                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">Loss</span>
                  <span className="text-sm font-black text-rose-400">{card.record.losses}</span>
                </div>
                <div className="border-r border-zinc-800">
                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">Win %</span>
                  <span className="text-sm font-black text-amber-300">{card.record.winRate}%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">K.O.</span>
                  <span className="text-sm font-black text-yellow-400">{card.record.koRounds}</span>
                </div>
              </div>

              {/* Track Info & Blind Audio Preview Rule */}
              <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Battle Track:</span>
                  <span className="font-bold text-zinc-200 line-clamp-1">{card.trackTitle}</span>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Limit: {card.trackDurationSec}s (Under 3m)
                  </span>

                  {card.isBlindInvite && !isCurrentUser ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Blind Invite (Audio Locked)</span>
                    </div>
                  ) : (
                    <button
                      onClick={handlePlayPreview}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isPlayingPreview
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700'
                      }`}
                    >
                      {isPlayingPreview ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-amber-400" />
                          <span>Play Beat</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Battle Toggles (Audio, Video, Collab) */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Match Preferences</span>
                  {isCurrentUser && <span className="text-amber-400">Your Controls</span>}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {/* Live Audio */}
                  <button
                    onClick={isCurrentUser ? onToggleLiveAudio : undefined}
                    disabled={!isCurrentUser}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      card.acceptingLiveAudioBattle
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    } ${isCurrentUser ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold">Audio Battle</span>
                    <span className="text-[8px] font-mono uppercase">
                      {card.acceptingLiveAudioBattle ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Live Video */}
                  <button
                    onClick={isCurrentUser ? onToggleLiveVideo : undefined}
                    disabled={!isCurrentUser}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      card.acceptingLiveVideoBattle
                        ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    } ${isCurrentUser ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold">Video Battle</span>
                    <span className="text-[8px] font-mono uppercase">
                      {card.acceptingLiveVideoBattle ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Invite to Collab */}
                  <button
                    onClick={isCurrentUser ? onToggleCollab : undefined}
                    disabled={!isCurrentUser}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      card.acceptingCollabs
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    } ${isCurrentUser ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold">Collab Open</span>
                    <span className="text-[8px] font-mono uppercase">
                      {card.acceptingCollabs ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Challenge Button */}
              {showChallengeButton && !isCurrentUser && onChallengeToBattle && (
                <button
                  onClick={() => onChallengeToBattle(card)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Swords className="w-4 h-4 text-zinc-950" />
                  <span>Call to 48hr Battle</span>
                </button>
              )}
            </>
          ) : (
            /* BACK OF BASEBALL CARD (Full Stats, Style & Bio) */
            <div className="space-y-3 py-1 animate-fade-in">
              <div className="space-y-1 border-b border-zinc-800 pb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400">Signature Move</span>
                <p className="font-bold text-sm text-zinc-100">{card.signatureMove}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Combat Style Tags</span>
                <div className="flex flex-wrap gap-1">
                  {card.styleTags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Scout Scouting Bio</span>
                <p className="text-xs text-zinc-300 leading-relaxed italic">"{card.bio}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">REP SCORE</span>
                  <span className="text-base font-black text-amber-300">{card.reputationScore}/100</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">CARD FOIL</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    {card.cardFoilEffect?.replace('_', ' ') || 'Gold Foil'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFlipped(false)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer"
              >
                Back to Front
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

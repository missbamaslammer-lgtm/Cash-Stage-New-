import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Send, 
  Users, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  Video, 
  Mic2, 
  DollarSign,
  Lock,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { CallToBattleMessage, BattleBaseballCard as CardType, UserProfile, BattleMatch } from '../types';
import { BattleBaseballCard } from './BattleBaseballCard';
import { audioEngine } from '../services/audioService';

interface CallToBattleChatProps {
  messages: CallToBattleMessage[];
  onSendMessage: (text: string, isChallenge: boolean, challengeDetails?: CallToBattleMessage['challengeDetails']) => void;
  onAcceptChallenge: (message: CallToBattleMessage) => void;
  user: UserProfile;
  onChallengeCard: (card: CardType) => void;
}

export const CallToBattleChat: React.FC<CallToBattleChatProps> = ({
  messages,
  onSendMessage,
  onAcceptChallenge,
  user,
  onChallengeCard,
}) => {
  const [inputText, setInputText] = useState('');
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [potAmount, setPotAmount] = useState(100);
  const [isBlindVote, setIsBlindVote] = useState(true);
  const [isLiveAudio, setIsLiveAudio] = useState(true);
  const [isLiveVideo, setIsLiveVideo] = useState(false);
  const [activeCardPreview, setActiveCardPreview] = useState<CardType | null>(null);

  // Live 48hr Countdown Simulation for battles
  const [timeRemainingSec, setTimeRemainingSec] = useState(154200); // 42.8 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSec((prev) => (prev > 0 ? prev - 1 : 172800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format48HrTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isChallengeMode) {
      audioEngine.playBattleBell();
      onSendMessage(inputText, true, {
        potAmount,
        isBlind: isBlindVote,
        isLiveAudio,
        isLiveVideo,
        stakeType: 'bucks',
        beatName: 'slammer_808_anthem',
      });
      setIsChallengeMode(false);
    } else {
      onSendMessage(inputText, false);
    }
    setInputText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Lobby Header & 48-Hour Live Arena Ticker */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-rose-950/40 border border-rose-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-inner">
              <Swords className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Call to Battle: Public Arena Lobby
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase border border-rose-500/40">
                  48-Hour Live Matchmaking
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Throw down open battle challenges, inspect opponent baseball stats cards, and battle live for cash pots
              </p>
            </div>
          </div>

          {/* 48-Hour Active Match Live Countdown Clock */}
          <div className="bg-zinc-950 p-3 rounded-2xl border border-rose-500/30 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                Current 48hr Battle Window
              </span>
              <span className="text-base font-black text-rose-400 font-mono tracking-wider">
                {format48HrTime(timeRemainingSec)} Left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Arena + Contender Card Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Real-Time Chat & Challenge Wall */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between h-[650px] shadow-xl">
          
          {/* Chat Messages Feed */}
          <div className="overflow-y-auto space-y-4 pr-2 flex-1">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-yellow-400" />
              <span>
                <strong>Stage Rule:</strong> All battles run for exactly 48 hours and cannot exceed 3 minutes (180s). Unbiased blind voting tallies post daily at 7:00 PM EST.
              </span>
            </div>

            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-4 rounded-2xl border transition ${
                  msg.isBattleChallenge 
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30' 
                    : 'bg-zinc-900/70 border-zinc-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={msg.senderAvatar} 
                      alt={msg.senderName} 
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 cursor-pointer hover:scale-105 transition"
                      onClick={() => setActiveCardPreview(msg.senderCard)}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{msg.senderName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-mono font-bold">
                          {msg.senderCrew}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* View Card Button */}
                  <button
                    onClick={() => setActiveCardPreview(msg.senderCard)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] font-bold transition cursor-pointer border border-zinc-700"
                  >
                    View Stats Card
                  </button>
                </div>

                <p className="text-sm text-zinc-200 mt-2.5 leading-relaxed">
                  {msg.text}
                </p>

                {/* If Battle Challenge Box */}
                {msg.isBattleChallenge && msg.challengeDetails && (
                  <div className="mt-3 bg-zinc-950/90 rounded-xl p-3 border border-rose-500/30 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="text-center bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                        <span className="text-[9px] uppercase font-bold text-rose-300 block">Pot Amount</span>
                        <span className="text-sm font-black text-white font-mono">${msg.challengeDetails.potAmount}</span>
                      </div>

                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                          {msg.challengeDetails.isBlind ? '🔒 Blind Anonymous Voting' : '🔓 Open Vote'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                          <span>{msg.challengeDetails.isLiveAudio ? '🎙️ Audio Live' : ''}</span>
                          <span>{msg.challengeDetails.isLiveVideo ? '📹 Video Live' : ''}</span>
                          <span>• 48h Live Match</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onAcceptChallenge(msg)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Accept Battle</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Form & Challenge Composer */}
          <form onSubmit={handleSend} className="pt-3 border-t border-zinc-800 space-y-2.5">
            
            {/* Challenge Mode Toggle Bar */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsChallengeMode(!isChallengeMode)}
                className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isChallengeMode
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{isChallengeMode ? '⚔️ Challenge Mode: ON' : 'Issue Battle Challenge'}</span>
              </button>

              <span className="text-[11px] text-zinc-500 font-mono">
                Your Balance: ${user.cashBalance.toFixed(2)} Bucks
              </span>
            </div>

            {/* If Challenge Mode Expanded Details */}
            {isChallengeMode && (
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-rose-500/30 space-y-2.5 animate-fade-in text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Cash Pot</label>
                    <select
                      value={potAmount}
                      onChange={(e) => setPotAmount(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-white font-mono font-bold"
                    >
                      <option value={50}>$50 Pot</option>
                      <option value={100}>$100 Pot</option>
                      <option value={250}>$250 Pot</option>
                      <option value={500}>$500 Pot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Voting Privacy</label>
                    <button
                      type="button"
                      onClick={() => setIsBlindVote(!isBlindVote)}
                      className={`w-full p-1.5 rounded-lg border font-bold transition text-[11px] ${
                        isBlindVote ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {isBlindVote ? '🔒 100% Blind' : '🔓 Open Vote'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Live Media</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setIsLiveAudio(!isLiveAudio)}
                        className={`flex-1 p-1.5 rounded-lg border text-[10px] font-bold ${
                          isLiveAudio ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        Audio
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLiveVideo(!isLiveVideo)}
                        className={`flex-1 p-1.5 rounded-lg border text-[10px] font-bold ${
                          isLiveVideo ? 'bg-blue-500/20 text-blue-300 border-blue-400' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input & Send */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isChallengeMode ? "Write your challenge terms (e.g. 'Looking for 140 BPM Memphis drill battle')..." : "Message the public battle lobby..."}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className={`p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                  isChallengeMode
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Contender Baseball Card Previewer / Your Card */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{activeCardPreview ? 'Opponent Card Scout' : 'Your Fighter Card'}</span>
              </h3>
              {activeCardPreview && (
                <button
                  onClick={() => setActiveCardPreview(null)}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  Show My Card
                </button>
              )}
            </div>

            <BattleBaseballCard
              card={activeCardPreview || user.baseballCard}
              isCurrentUser={!activeCardPreview}
              onChallengeToBattle={onChallengeCard}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

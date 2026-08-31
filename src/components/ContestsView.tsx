import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Clock, 
  DollarSign, 
  Coins, 
  CheckCircle2, 
  Sparkles, 
  Swords, 
  Users, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Contest, UserProfile } from '../types';
import { audioEngine } from '../services/audioService';

interface ContestsViewProps {
  contests: Contest[];
  user: UserProfile;
  onEnterContest: (contestId: string) => void;
  onOpenStudio: () => void;
}

export const ContestsView: React.FC<ContestsViewProps> = ({
  contests,
  user,
  onEnterContest,
  onOpenStudio,
}) => {
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [enteredContestId, setEnteredContestId] = useState<string | null>(null);

  const handleEnter = (contest: Contest) => {
    if (user.cashBalance < contest.entryFeeBucks) {
      alert(`Insufficient Cash Stage Bucks! Entry fee is $${contest.entryFeeBucks.toFixed(2)}.`);
      return;
    }
    audioEngine.playCashSound();
    onEnterContest(contest.id);
    setEnteredContestId(contest.id);
    setTimeout(() => {
      setEnteredContestId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Contests Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Official Stage Contests & Tournaments
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/40">
                  Verified Cash Pots
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Enter sanctioned lyrical tournaments judged 100% blindly by the anonymous voting jury
              </p>
            </div>
          </div>

          <button
            onClick={onOpenStudio}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
          >
            <Swords className="w-4 h-4 text-zinc-950" />
            <span>Record Contest Entry</span>
          </button>
        </div>
      </div>

      {/* Contests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition group"
          >
            <div>
              {/* Contest Banner Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={contest.bannerImage}
                  alt={contest.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                {/* Prize Pot Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-zinc-950 font-black text-xs shadow-lg flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>${contest.grandPrizePot.toLocaleString()} Pot</span>
                </div>

                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  {contest.category}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-black text-lg text-white drop-shadow-md leading-tight">
                    {contest.title}
                  </h3>
                </div>
              </div>

              {/* Contest Details */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {contest.description}
                </p>

                {/* Rules List */}
                <div className="space-y-1.5 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-300">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                    Entry Rules & Guidelines:
                  </span>
                  {contest.rules.map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Deadline & Submissions info */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ends: {contest.deadlineText}</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">{contest.totalEntries}</span> Entries
                  </div>
                </div>
              </div>
            </div>

            {/* Entry Action Bar */}
            <div className="p-5 pt-0">
              {enteredContestId === contest.id || contest.userEntered ? (
                <div className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entry Registered in Tournament!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleEnter(contest)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enter Contest (${contest.entryFeeBucks.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

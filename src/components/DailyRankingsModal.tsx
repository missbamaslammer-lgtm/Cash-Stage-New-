import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Users, 
  Swords, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Sparkles, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import { DailyRankingCategory } from '../types';
import { INITIAL_DAILY_RANKINGS } from '../data/initialData';

interface DailyRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRankingsModal: React.FC<DailyRankingsModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'battlers' | 'collabs' | 'crews'>('battlers');
  const [countdown, setCountdown] = useState({
    battlers: '01h 14m 22s',
    collabs: '03h 14m 22s',
    crews: '05h 14m 22s',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // Live second tick
      const now = new Date();
      // Calculate remaining to 7pm, 9pm, 11pm EST
      const getRemaining = (targetHour: number) => {
        const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const target = new Date(estNow);
        target.setHours(targetHour, 0, 0, 0);
        if (target.getTime() <= estNow.getTime()) {
          target.setDate(target.getDate() + 1);
        }
        const diffMs = target.getTime() - estNow.getTime();
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
      };

      setCountdown({
        battlers: getRemaining(19), // 7:00 PM EST
        collabs: getRemaining(21),  // 9:00 PM EST
        crews: getRemaining(23),    // 11:00 PM EST
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const currentCategoryData = INITIAL_DAILY_RANKINGS.find((c) => c.type === activeCategory) || INITIAL_DAILY_RANKINGS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Daily Stage Rankings</h2>
              <p className="text-xs text-zinc-400">
                Official leaderboard scores posted strictly by 7 PM, 9 PM, & 11 PM EST daily
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Categories Tab Switcher with Real-time Countdowns */}
        <div className="grid grid-cols-3 gap-2">
          {/* Battlers: 7:00 PM EST */}
          <button
            onClick={() => setActiveCategory('battlers')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeCategory === 'battlers'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-black text-white">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Battlers</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold block mt-0.5">Posts 7:00 PM EST</span>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-1">
              <Clock className="w-3 h-3" />
              <span>{countdown.battlers}</span>
            </div>
          </button>

          {/* Collabs: 9:00 PM EST */}
          <button
            onClick={() => setActiveCategory('collabs')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeCategory === 'collabs'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-400/40'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-black text-white">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Collabs</span>
            </div>
            <span className="text-[10px] text-purple-400 font-bold block mt-0.5">Posts 9:00 PM EST</span>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-1">
              <Clock className="w-3 h-3" />
              <span>{countdown.collabs}</span>
            </div>
          </button>

          {/* Crews: 11:00 PM EST */}
          <button
            onClick={() => setActiveCategory('crews')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeCategory === 'crews'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-black text-white">
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crews</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Posts 11:00 PM EST</span>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-1">
              <Clock className="w-3 h-3" />
              <span>{countdown.crews}</span>
            </div>
          </button>
        </div>

        {/* Active Category Header */}
        <div className="bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">{currentCategoryData.title}</h3>
            <p className="text-xs text-zinc-400">{currentCategoryData.subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-mono">DAILY DEADLINE</span>
            <span className="text-xs font-black text-amber-300 font-mono">
              {currentCategoryData.postTimeEST}
            </span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-2">
          {currentCategoryData.leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                item.rank === 1
                  ? 'bg-gradient-to-r from-amber-500/20 via-zinc-900 to-amber-950/30 border-amber-500/50 shadow-md'
                  : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono bg-zinc-800 border border-zinc-700">
                  {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                </div>

                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white">{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Earnings: ${item.cashEarned.toLocaleString()} Bucks
                  </span>
                </div>
              </div>

              {/* Metric & Trend */}
              <div className="text-right flex items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    {item.scoreLabel}
                  </span>
                  <span className="text-sm font-black text-white font-mono">{item.scoreValue}</span>
                </div>

                <div className="p-1 rounded-lg bg-zinc-800">
                  {item.change === 'up' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : item.change === 'down' ? (
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

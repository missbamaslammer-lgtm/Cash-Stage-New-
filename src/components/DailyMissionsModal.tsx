import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Gift, 
  ArrowRight, 
  DollarSign, 
  Disc, 
  Vote, 
  Mic2, 
  Repeat, 
  Zap, 
  Lock,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyMission, DailyMissionState } from '../types';
import { audioEngine } from '../services/audioService';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionState: DailyMissionState;
  onClaimReward: (missionId: string) => void;
  onClaimGrandChest: () => void;
  onNavigateToMission: (tab: string) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  missionState,
  onClaimReward,
  onClaimGrandChest,
  onNavigateToMission,
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate countdown to midnight for daily reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const missions = missionState.missions;
  const completedCount = missions.filter((m) => m.isCompleted).length;
  const allCompleted = completedCount === missions.length;
  const unclaimedCount = missions.filter((m) => m.isCompleted && !m.isClaimed).length;

  const handleClaim = (mission: DailyMission) => {
    audioEngine.playCashSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ffffff'],
    });
    onClaimReward(mission.id);
  };

  const handleClaimChest = () => {
    audioEngine.playCashSound();
    audioEngine.playAirhorn();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#eab308', '#ec4899', '#3b82f6'],
    });
    onClaimGrandChest();
  };

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Disc':
        return <Disc className="w-5 h-5 text-amber-400" />;
      case 'Vote':
        return <Vote className="w-5 h-5 text-purple-400" />;
      case 'Mic2':
        return <Mic2 className="w-5 h-5 text-red-400" />;
      case 'DollarSign':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'Repeat':
        return <Repeat className="w-5 h-5 text-yellow-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  const streakDays = [
    { day: 1, reward: '+50 XP', status: 'completed' },
    { day: 2, reward: '+75 XP', status: 'completed' },
    { day: 3, reward: '+$5 Cash', status: 'completed' },
    { day: 4, reward: '+100 XP', status: 'completed' },
    { day: 5, reward: '+$10 Cash', status: 'today' },
    { day: 6, reward: '+150 XP', status: 'upcoming' },
    { day: 7, reward: '👑 Grand Chest', status: 'upcoming' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-400 border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-white tracking-tight">Daily Stage Missions</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Daily Quests
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Complete creator tasks every 24 hours to earn bonus Stage XP & cash rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-900 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 7-Day Login & Quest Streak */}
        <div className="bg-zinc-900/90 border border-amber-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{missionState.streakDays}-Day Creator Streak</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Resets in {timeLeft}</span>
            </div>
          </div>

          {/* 7 Day Badges */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {streakDays.map((s, idx) => {
              const isDone = s.status === 'completed';
              const isToday = s.status === 'today';
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl text-center flex flex-col items-center justify-center space-y-1 transition ${
                    isToday
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40'
                      : isDone
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-zinc-950/60 border border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">Day {s.day}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isToday ? (
                    <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  ) : (
                    <Gift className="w-4 h-4 text-zinc-600" />
                  )}
                  <span className="text-[9px] font-mono leading-none">{s.reward}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missions Progress & Grand Chest Banner */}
        <div className="bg-gradient-to-r from-amber-950/50 via-zinc-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
            <div className="text-xs text-zinc-300 font-bold flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Daily Completion: {completedCount} / {missions.length} Missions</span>
            </div>
            <div className="w-full sm:w-64 h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / missions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Grand Chest Action */}
          <div>
            {missionState.bonusGrandChestClaimed ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Grand Chest Claimed!</span>
              </div>
            ) : allCompleted ? (
              <button
                onClick={handleClaimChest}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/40 hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Gift className="w-4 h-4 text-zinc-950" />
                <span>Claim Grand Chest (+500 XP +$50)!</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Unlock Chest ({missions.length - completedCount} left)</span>
              </div>
            )}
          </div>
        </div>

        {/* Mission Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold px-1">
            <span>Today's Stage Objectives</span>
            {unclaimedCount > 0 && (
              <span className="text-amber-400 animate-pulse font-black">
                {unclaimedCount} reward{unclaimedCount > 1 ? 's' : ''} ready to claim!
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.currentProgress / mission.targetProgress) * 100));

              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-2xl border transition duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    mission.isClaimed
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-75'
                      : mission.isCompleted
                      ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border-emerald-500/40 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex-shrink-0 mt-0.5">
                      {getMissionIcon(mission.iconName)}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-100">{mission.title}</h4>
                        {mission.isClaimed ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Claimed
                          </span>
                        ) : mission.isCompleted ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Ready
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {mission.currentProgress} / {mission.targetProgress} {mission.unit}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Progress bar */}
                      <div className="pt-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              mission.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 font-bold">
                          {progressPct}%
                        </span>
                      </div>

                      {/* Rewards Badges */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          +{mission.rewardPoints} XP
                        </span>
                        {mission.rewardCash && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            +${mission.rewardCash.toFixed(2)} Cash
                          </span>
                        )}
                        {mission.rewardCredits && (
                          <span className="text-[10px] font-black text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                            +{mission.rewardCredits} L4L PTS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="w-full sm:w-auto flex-shrink-0 flex items-center justify-end">
                    {mission.isClaimed ? (
                      <div className="flex items-center gap-1 text-xs text-zinc-500 font-bold py-2 px-3">
                        <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                        <span>Claimed</span>
                      </div>
                    ) : mission.isCompleted ? (
                      <button
                        onClick={() => handleClaim(mission)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 animate-bounce"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Claim Reward</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToMission(mission.actionTab);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{mission.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 text-center">
          Missions refresh every 24 hours at 00:00. Maintain your daily streak to earn multiplier bonuses in the tournament finals!
        </div>

      </div>
    </div>
  );
};

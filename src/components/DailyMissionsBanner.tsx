import React from 'react';
import { Trophy, Flame, Sparkles, CheckCircle2, ArrowRight, Gift, Disc, Vote, Mic2, DollarSign, Repeat } from 'lucide-react';
import { DailyMissionState, DailyMission } from '../types';

interface DailyMissionsBannerProps {
  missionState: DailyMissionState;
  onOpenMissionsModal: () => void;
  onClaimReward: (missionId: string) => void;
  onNavigateToMission: (tab: string) => void;
}

export const DailyMissionsBanner: React.FC<DailyMissionsBannerProps> = ({
  missionState,
  onOpenMissionsModal,
  onClaimReward,
  onNavigateToMission,
}) => {
  const missions = missionState.missions;
  const completedCount = missions.filter((m) => m.isCompleted).length;
  const unclaimedCount = missions.filter((m) => m.isCompleted && !m.isClaimed).length;
  const progressPct = Math.round((completedCount / missions.length) * 100);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Disc':
        return <Disc className="w-3.5 h-3.5 text-amber-400" />;
      case 'Vote':
        return <Vote className="w-3.5 h-3.5 text-purple-400" />;
      case 'Mic2':
        return <Mic2 className="w-3.5 h-3.5 text-red-400" />;
      case 'DollarSign':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Repeat':
        return <Repeat className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight">Daily Stage Missions</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold border border-orange-500/30">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>{missionState.streakDays}-Day Streak</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">
              {completedCount} of {missions.length} completed • Earn bonus Stage Points and Cash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {unclaimedCount > 0 && (
            <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 animate-pulse">
              🎉 {unclaimedCount} Claim Ready!
            </span>
          )}
          <button
            onClick={onOpenMissionsModal}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-amber-500/40"
          >
            <span>View All Quests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Mission Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
        {missions.map((m) => {
          const itemProgressPct = Math.min(100, Math.round((m.currentProgress / m.targetProgress) * 100));

          return (
            <div
              key={m.id}
              onClick={() => {
                if (m.isCompleted && !m.isClaimed) {
                  onClaimReward(m.id);
                } else if (!m.isCompleted) {
                  onNavigateToMission(m.actionTab);
                }
              }}
              className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-2.5 ${
                m.isClaimed
                  ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                  : m.isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/40 hover:scale-[1.02]'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    {getIcon(m.iconName)}
                  </div>
                  <span className="font-bold text-xs text-zinc-200 line-clamp-1">{m.title.split(':')[0]}</span>
                </div>

                {m.isClaimed ? (
                  <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                ) : m.isCompleted ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 animate-bounce">
                    Claim
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {m.currentProgress}/{m.targetProgress}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${itemProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-amber-300 font-bold">+{m.rewardPoints} XP</span>
                  {m.rewardCash && <span className="text-emerald-400 font-bold">+${m.rewardCash}</span>}
                  {m.rewardCredits && <span className="text-yellow-400 font-bold">+{m.rewardCredits} L4L</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

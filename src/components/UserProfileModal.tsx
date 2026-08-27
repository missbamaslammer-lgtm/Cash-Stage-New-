import React, { useState } from 'react';
import { UserProfile, Track } from '../types';
import { 
  Wallet, 
  Trophy, 
  Crown, 
  DollarSign, 
  Sparkles, 
  Repeat, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Disc, 
  Users 
} from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  userTracks: Track[];
  onAddCash: (amount: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userTracks,
  onAddCash,
}) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'wallet' | 'tracks'>('overview');
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeposit = () => {
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;
    audioEngine.playCashSound();
    onAddCash(num);
    setTxSuccess(`+$${num.toFixed(2)} deposited into your Cash Stage pot!`);
    setTimeout(() => setTxSuccess(null), 3000);
  };

  const handleWithdraw = () => {
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0 || num > user.cashBalance) {
      alert('Invalid withdrawal amount or exceeds available balance.');
      return;
    }
    audioEngine.playCashSound();
    onAddCash(-num);
    setTxSuccess(`$${num.toFixed(2)} withdrawn to your connected account!`);
    setTimeout(() => setTxSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header Profile Info */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-white">{user.name}</h3>
                {user.isVerified && <Trophy className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-amber-400 font-mono">{user.handle}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                <Users className="w-3 h-3 text-zinc-500" />
                <span>{user.crewName || 'Independent Artist'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs">
          {[
            { id: 'overview', label: 'Overview & Badges' },
            { id: 'wallet', label: 'Cash Wallet & Pot' },
            { id: 'tracks', label: `My Tracks (${userTracks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeSubTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Cash Balance</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  ${user.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Battle Record</div>
                <div className="text-lg font-black text-amber-400 mt-0.5">
                  {user.battlesWon} Victories
                </div>
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">L4L Credits</div>
                <div className="text-lg font-black text-yellow-300 mt-0.5">
                  {user.listenCredits} PTS
                </div>
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Stage Rank Points</div>
                <div className="text-lg font-black text-purple-400 mt-0.5">
                  {user.stagePoints} XP
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-zinc-300">Earned Stage Badges</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-bold text-zinc-200">Stage Founder</div>
                    <div className="text-[10px] text-zinc-500">Alabama Slammer Official</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-zinc-200">Verified Artist</div>
                    <div className="text-[10px] text-zinc-500">Original Music Creator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wallet */}
        {activeSubTab === 'wallet' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/40 p-5 rounded-3xl text-center space-y-1">
              <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Available Cash Balance</div>
              <div className="text-3xl font-black text-emerald-400">
                ${user.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-zinc-400">Earned from Battle Tournaments, Tips, & L4L Promotions</p>
            </div>

            {txSuccess && (
              <div className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs font-bold text-center animate-fade-in">
                ✓ {txSuccess}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400">Transaction Amount ($USD)</label>
              <input
                type="number"
                min="10"
                step="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDeposit}
                className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>
              <button
                onClick={handleWithdraw}
                className="py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw Cash</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: My Tracks */}
        {activeSubTab === 'tracks' && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {userTracks.map((t) => (
              <div key={t.id} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={t.coverArt} alt={t.title} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <h5 className="font-bold text-xs text-white">{t.title}</h5>
                    <div className="text-[10px] text-zinc-400">{t.genre} • {t.plays.toLocaleString()} plays</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">${t.cashEarned.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">earned</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

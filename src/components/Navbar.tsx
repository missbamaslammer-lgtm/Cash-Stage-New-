import React from 'react';
import { DollarSign, ShieldAlert, Sparkles, Trophy, Disc, Mic2, Vote, Repeat, Users, Smartphone, Wallet } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onOpenBlockedModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAABModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenBlockedModal,
  onOpenProfileModal,
  onOpenAABModal,
}) => {
  const navItems = [
    { id: 'listen_now', label: 'Listen Now', icon: Disc, badge: 'LIVE' },
    { id: 'recording_studio', label: 'Recording Studio', icon: Mic2, badge: 'DAW' },
    { id: 'anonymous_voting', label: 'Anonymous Voting', icon: Vote, badge: '$500 POT' },
    { id: 'listen_4_listen', label: 'Listen 4 Listen', icon: Repeat, badge: '+CREDITS' },
    { id: 'crews', label: 'Crews & Squads', icon: Users, badge: 'WARS' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/20 text-white shadow-2xl">
      {/* Top Banner with Alabama Slammer branding */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-600/30 to-amber-900/40 border-b border-amber-500/10 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider text-amber-300">CASH STAGE</span>
          <span className="text-zinc-400">|</span>
          <span>Created by <strong className="text-amber-400 font-bold">Alabama Slammer</strong></span>
          <span className="hidden md:inline text-zinc-400">• Official Android App & Battle Arena</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAABModal}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-[11px] font-medium transition cursor-pointer"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Android Studio AAB Hub</span>
            <span className="sm:hidden">AAB Code</span>
          </button>

          <button
            onClick={onOpenBlockedModal}
            className="flex items-center gap-1 text-zinc-400 hover:text-red-400 text-[11px] transition cursor-pointer"
            title="Manage Blocked Artists"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Blocked Artists</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('listen_now')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-400 font-black animate-pulse" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase">
                Cash Stage
              </h1>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">
              by Bama Slammer
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${
                      isActive
                        ? 'bg-zinc-950/40 text-white'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Wallet & User Profile Stats */}
        <div className="flex items-center gap-2.5">
          {/* Cash Balance Pill */}
          <div 
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer shadow-inner"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-400 leading-tight uppercase font-semibold">Cash Pot</div>
              <div className="text-xs font-black text-emerald-400 tracking-tight">
                ${user.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Listen Credits */}
          <div 
            onClick={() => setActiveTab('listen_4_listen')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer text-xs"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">{user.listenCredits}</span>
            <span className="text-[10px] text-zinc-400">L4L</span>
          </div>

          {/* User Avatar Button */}
          <button
            onClick={onOpenProfileModal}
            className="relative flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition cursor-pointer"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-500/50"
            />
            <div className="hidden md:block text-left pr-1.5">
              <div className="text-xs font-bold text-zinc-200 leading-tight flex items-center gap-1">
                {user.name}
                {user.isVerified && <Trophy className="w-3 h-3 text-amber-400" />}
              </div>
              <div className="text-[10px] text-zinc-400">{user.crewName || 'No Crew'}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto no-scrollbar border-t border-zinc-800 bg-zinc-950">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { ShieldAlert, Ban, CheckCircle2, UserX, Plus, Search, Trash2 } from 'lucide-react';
import { BlockedArtist } from '../types';

interface BlockedArtistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedArtists: BlockedArtist[];
  onUnblockArtist: (id: string) => void;
  onBlockNewArtist: (name: string, reason: string) => void;
}

export const BlockedArtistsModal: React.FC<BlockedArtistsModalProps> = ({
  isOpen,
  onClose,
  blockedArtists,
  onUnblockArtist,
  onBlockNewArtist,
}) => {
  const [newArtistName, setNewArtistName] = useState('');
  const [newReason, setNewReason] = useState('Offensive content or spam');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = blockedArtists.filter((b) =>
    b.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    onBlockNewArtist(newArtistName.trim(), newReason);
    setNewArtistName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-red-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Blocked Artists & Safety</h3>
              <p className="text-xs text-zinc-400">Manage your block list and content filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Block An Artist Input Form */}
        <form onSubmit={handleBlockSubmit} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-xs text-zinc-300 flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-red-400" />
            Block an Artist or Creator
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Artist username or handle (e.g. @spammer)..."
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center gap-2">
              <select
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
              >
                <option value="Offensive content or spam">Offensive content or spam</option>
                <option value="Audio copyright infringement">Audio copyright infringement</option>
                <option value="Harassment in Crew Lounge">Harassment in Crew Lounge</option>
                <option value="Unfair voting manipulation">Unfair voting manipulation</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Block</span>
              </button>
            </div>
          </div>
        </form>

        {/* Search List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-zinc-300">
              Blocked Artists List ({blockedArtists.length})
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search blocked..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-6 pr-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-2" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 text-center text-xs text-zinc-500">
              No blocked artists found. You have a clean feed!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.artistName}
                      className="w-10 h-10 rounded-xl object-cover grayscale ring-1 ring-red-500/30"
                    />
                    <div>
                      <div className="font-bold text-xs text-zinc-200">{item.artistName}</div>
                      <div className="text-[10px] text-red-400/80">{item.reason}</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Blocked on {item.blockedAt}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onUnblockArtist(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-950/60 text-zinc-300 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unblock</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Protection Explainer */}
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
          <strong className="text-amber-400">Strict Anti-Harassment & Fair Play Rules:</strong>
          <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
            <li>Blocked artists <strong>CANNOT vote on your tracks</strong> in blind or public voting.</li>
            <li>Blocked artists <strong>CANNOT see your drops, profile, or stems</strong> anywhere on Cash Stage.</li>
            <li>Blocked artists <strong>CANNOT invite you to collabs</strong> or challenge you to battles.</li>
            <li>All of their tracks and comments are completely hidden from your stream.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

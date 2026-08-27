import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Crown, 
  DollarSign, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  Swords, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Star,
  Flame,
  Radio
} from 'lucide-react';
import { Crew, UserProfile } from '../types';

interface CrewsViewProps {
  crews: Crew[];
  user: UserProfile;
  onCreateCrew: (newCrew: Crew) => void;
  onJoinCrew: (crewId: string) => void;
}

export const CrewsView: React.FC<CrewsViewProps> = ({
  crews,
  user,
  onCreateCrew,
  onJoinCrew,
}) => {
  const [selectedCrewId, setSelectedCrewId] = useState<string>(crews[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Crew Form State
  const [crewName, setCrewName] = useState('');
  const [crewTag, setCrewTag] = useState('');
  const [crewBio, setCrewBio] = useState('');
  const [minPoints, setMinPoints] = useState(500);

  // Crew Live Chat
  const [chatMessages, setChatMessages] = useState<Record<string, { id: string; user: string; text: string; time: string }[]>>({
    crew_bama_01: [
      { id: '1', user: 'Alabama Slammer', text: 'Welcome to the Mob family! Tournament finals tonight!', time: '12m ago' },
      { id: '2', user: 'Metro South', text: 'Just uploaded 3 new 808 beats in the DAW beat selector!', time: '5m ago' },
      { id: '3', user: 'D-Bama Flow', text: 'Let’s secure the #1 Crew Rank this season! 👑🔥', time: '1m ago' },
    ],
  });
  const [chatInput, setChatInput] = useState('');

  const selectedCrew = crews.find((c) => c.id === selectedCrewId) || crews[0];

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedCrew) return;
    const newMsg = {
      id: Date.now().toString(),
      user: user.name,
      text: chatInput.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => ({
      ...prev,
      [selectedCrew.id]: [...(prev[selectedCrew.id] || []), newMsg],
    }));
    setChatInput('');
  };

  const handleCreateSubmit = () => {
    if (!crewName.trim() || !crewTag.trim()) return;

    const newCrew: Crew = {
      id: `crew_${Date.now()}`,
      name: crewName.trim(),
      tag: `[${crewTag.trim().toUpperCase().replace(/[\[\]]/g, '')}]`,
      leader: user.name,
      leaderAvatar: user.avatar,
      membersCount: 1,
      totalEarnings: 0,
      battleWins: 0,
      rank: crews.length + 1,
      bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      bio: crewBio.trim() || 'New rising independent artist squad on Cash Stage.',
      isRecruiting: true,
      minPointsToJoin: minPoints,
      members: [
        { id: user.id, name: user.name, role: 'Leader', points: user.stagePoints },
      ],
      recentDrops: ['New Crew Debut Track'],
    };

    onCreateCrew(newCrew);
    setShowCreateModal(false);
    setSelectedCrewId(newCrew.id);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-amber-950/40 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40">
              <Users className="w-3.5 h-3.5" />
              Artist Crews & Record Squads
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Crew Wars & Record Labels
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Team up with fellow producers, lyricists, and vocalists. Compete in Crew Tournaments, split collective cash pots, and dominate the leaderboard!
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Crew</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Crew Leaderboard & Active Crew Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Crew Leaderboard Rankings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Crew Leaderboard
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Season 4</span>
            </div>

            <div className="space-y-3">
              {crews.map((crew, idx) => {
                const isSelected = crew.id === selectedCrewId;
                return (
                  <div
                    key={crew.id}
                    onClick={() => setSelectedCrewId(crew.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Rank Number */}
                    <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-500 text-zinc-950'
                        : idx === 1
                        ? 'bg-zinc-300 text-zinc-950'
                        : idx === 2
                        ? 'bg-amber-800 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white truncate">{crew.name}</h4>
                        <span className="text-[10px] font-black text-amber-400 font-mono">{crew.tag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-emerald-400 font-semibold">${crew.totalEarnings.toLocaleString()} Won</span>
                        <span>•</span>
                        <span>{crew.membersCount} Members</span>
                      </div>
                    </div>

                    {crew.id === user.crewId && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        MY CREW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Crew Showcase & Internal Lounge (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCrew && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              {/* Crew Banner */}
              <div className="relative h-44 w-full">
                <img
                  src={selectedCrew.bannerImage}
                  alt={selectedCrew.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                <div className="absolute bottom-4 inset-x-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCrew.leaderAvatar}
                      alt={selectedCrew.leader}
                      className="w-14 h-14 rounded-2xl ring-2 ring-amber-400 object-cover shadow-2xl"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-white">{selectedCrew.name}</h3>
                        <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {selectedCrew.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">Leader: <strong className="text-amber-300">{selectedCrew.leader}</strong></p>
                    </div>
                  </div>

                  {/* Join / Status Action */}
                  <div>
                    {selectedCrew.id === user.crewId ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Active Member
                      </span>
                    ) : (
                      <button
                        onClick={() => onJoinCrew(selectedCrew.id)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow transition cursor-pointer"
                      >
                        Join Crew (Requires {selectedCrew.minPointsToJoin} PTS)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Crew Details & Stats */}
              <div className="p-6 space-y-6">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  {selectedCrew.bio}
                </p>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Cash Won</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      ${selectedCrew.totalEarnings.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Battle Wins</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">
                      {selectedCrew.battleWins} WINS
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Squad Size</div>
                    <div className="text-sm font-black text-zinc-200 mt-0.5">
                      {selectedCrew.membersCount} Artists
                    </div>
                  </div>
                </div>

                {/* Crew Lounge & Chat */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Crew Lounge & Strategy Room
                  </h4>

                  <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(chatMessages[selectedCrew.id] || []).map((msg) => (
                        <div key={msg.id} className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span className="font-bold text-amber-400">{msg.user}</span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="text-zinc-200 mt-1">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                      <input
                        type="text"
                        placeholder={`Chat with ${selectedCrew.name}...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>

      {/* Create Crew Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Create Artist Crew</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Crew Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dirty South Cartel"
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Crew Tag (3-5 letters)</label>
                <input
                  type="text"
                  placeholder="e.g. DSC"
                  value={crewTag}
                  onChange={(e) => setCrewTag(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Crew Bio & Mission</label>
                <textarea
                  rows={3}
                  placeholder="What makes your sound unique? Trap, Drill, Southern bars?"
                  value={crewBio}
                  onChange={(e) => setCrewBio(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Minimum Stage Points to Join</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={minPoints}
                  onChange={(e) => setMinPoints(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <button
                onClick={handleCreateSubmit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-zinc-950 font-black text-sm transition cursor-pointer"
              >
                Launch Crew
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

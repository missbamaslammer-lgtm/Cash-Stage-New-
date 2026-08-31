import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Flame, 
  DollarSign, 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  Award, 
  Ban, 
  PlusCircle, 
  Send,
  Zap,
  Music4,
  Eye,
  Headphones,
  Users,
  Swords,
  Clock,
  Pin
} from 'lucide-react';
import { Track, DailyMissionState, BlockedArtist } from '../types';
import { audioEngine } from '../services/audioService';
import { DailyMissionsBanner } from './DailyMissionsBanner';

interface ListenNowViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onThrowCash: (amount: number, track: Track) => void;
  onBlockArtist: (artistName: string, artistAvatar: string) => void;
  onOpenStudio: () => void;
  blockedArtists: BlockedArtist[];
  missionState?: DailyMissionState;
  onOpenMissionsModal?: () => void;
  onClaimReward?: (missionId: string) => void;
  onNavigateToMission?: (tab: string) => void;
  onOpenStoreModal?: () => void;
}

export const ListenNowView: React.FC<ListenNowViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onThrowCash,
  onBlockArtist,
  onOpenStudio,
  blockedArtists,
  missionState,
  onOpenMissionsModal,
  onClaimReward,
  onNavigateToMission,
  onOpenStoreModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedTrackIds, setLikedTrackIds] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, { id: string; user: string; text: string; time: string }[]>>({
    trk_01: [
      { id: 'c1', user: 'MobileDJ_99', text: 'Bama Slammer snapped on this 808 drop!! 🔥🔥', time: '2m ago' },
      { id: 'c2', user: 'TrapKing_88', text: 'Playing this in the ride all weekend! Real Dirty South music!', time: '14m ago' },
    ],
  });
  const [newCommentText, setNewCommentText] = useState('');
  const [activeCommentTrackId, setActiveCommentTrackId] = useState<string | null>(null);

  // Filter blocked artists out so blocked creators can NOT see or be seen
  const blockedNames = new Set(blockedArtists.map((b) => b.artistName.toLowerCase()));

  const filteredTracks = tracks
    .filter((t) => !blockedNames.has(t.artist.toLowerCase()))
    .filter((t) => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Solo') return t.dropType === 'solo';
      if (selectedCategory === 'Collabs') return t.dropType === 'collab';
      if (selectedCategory === 'Battles') return t.dropType === 'battle';
      return t.genre === selectedCategory;
    });

  // Spotlight Pinned Track (3.99 live feed spotlight)
  const spotlightTrack = tracks.find((t) => t.isPinnedSpotlight) || tracks[0];

  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const handleAddComment = (trackId: string) => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      user: 'Bama Fan 👑',
      text: newCommentText.trim(),
      time: 'Just now',
    };
    setComments((prev) => ({
      ...prev,
      [trackId]: [newComment, ...(prev[trackId] || [])],
    }));
    setNewCommentText('');
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-32">
      
      {/* Pinned Live Feed Spotlight Banner ($3.99 Feature) */}
      {spotlightTrack && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/50 p-6 md:p-8 shadow-2xl ring-1 ring-amber-400/20">
          <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>Live Feed Spotlight Pin ($3.99)</span>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 pt-4 sm:pt-0">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>Featured #1 Stage Headliner</span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {spotlightTrack.title}
              </h2>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm text-zinc-300 font-mono">
                <div className="flex items-center gap-2">
                  <img
                    src={spotlightTrack.artistAvatar}
                    alt={spotlightTrack.artist}
                    className="w-7 h-7 rounded-full ring-2 ring-amber-400 object-cover"
                  />
                  <span className="font-bold text-amber-300">{spotlightTrack.artist}</span>
                </div>
                <span>•</span>
                <span className="text-zinc-400">{spotlightTrack.genre}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5" />
                  {spotlightTrack.plays.toLocaleString()} Plays
                </span>
                <span>•</span>
                <span className="text-blue-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {spotlightTrack.views.toLocaleString()} Views
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">${spotlightTrack.cashEarned.toLocaleString()} Won</span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans line-clamp-2">
                "Step up on the Cash Stage, throw that green high. Heavy southern 808s shaking up Mobile and the Dirty South. Alabama Slammer bringing raw fire."
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onPlayTrack(spotlightTrack)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black shadow-lg shadow-amber-500/30 transition active:scale-95 cursor-pointer hover:scale-105"
                >
                  {currentTrack?.id === spotlightTrack.id && isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pause Stage</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Listen Live Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    audioEngine.playCashSound();
                    onThrowCash(25, spotlightTrack);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer hover:scale-105"
                >
                  <DollarSign className="w-4 h-4 text-yellow-300" />
                  <span>Throw $25 Cash</span>
                </button>

                <button
                  onClick={onOpenStudio}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold border border-zinc-700 transition active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Record in Studio</span>
                </button>
              </div>
            </div>

            {/* Visual Cover Stage Box */}
            <div className="relative group flex-shrink-0 w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40">
              <img
                src={spotlightTrack.coverArt}
                alt={spotlightTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE NOW
                  </span>
                  <span className="text-amber-300 font-mono">{spotlightTrack.bpm} BPM • {formatDuration(spotlightTrack.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Missions Stage Banner */}
      {missionState && onOpenMissionsModal && onClaimReward && onNavigateToMission && (
        <DailyMissionsBanner
          missionState={missionState}
          onOpenMissionsModal={onOpenMissionsModal}
          onClaimReward={onClaimReward}
          onNavigateToMission={onNavigateToMission}
        />
      )}

      {/* Categories & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Solo', 'Collabs', 'Battles', 'Southern Rap', 'Trap', 'Drill'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat === 'Solo' ? 'Solo Drops (2m)' : cat === 'Collabs' ? 'Collabs (6m)' : cat === 'Battles' ? 'Battles (3m)' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Showing <strong className="text-zinc-200">{filteredTracks.length}</strong> active drops</span>
        </div>
      </div>

      {/* Track Cards Grid with Views, Plays, and Block Protections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          const isTrackPlaying = isCurrent && isPlaying;
          const isLiked = likedTrackIds[track.id];
          const trackComments = comments[track.id] || [];
          const isCommentOpen = activeCommentTrackId === track.id;

          return (
            <div
              key={track.id}
              className={`rounded-3xl border transition-all duration-300 bg-zinc-900/90 backdrop-blur-sm overflow-hidden flex flex-col ${
                isCurrent
                  ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'border-zinc-800 hover:border-zinc-700 shadow-lg'
              }`}
            >
              {/* Cover Art Box */}
              <div className="relative aspect-video w-full overflow-hidden group">
                <img
                  src={track.coverArt}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Top Badge Indicators */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                      {track.genre}
                    </span>

                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                      track.dropType === 'collab' 
                        ? 'bg-purple-500 text-white' 
                        : track.dropType === 'battle' 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {track.dropType === 'solo' ? 'Solo (2m)' : track.dropType === 'collab' ? 'Collab (6m)' : 'Battle (3m)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {track.collabOpen && (
                      <span className="px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 text-[10px] font-black uppercase border border-purple-800">
                        Collab Open
                      </span>
                    )}

                    {/* Block Artist Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockArtist(track.artist, track.artistAvatar);
                      }}
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition"
                      title={`Block artist ${track.artist} (cannot vote or see your tracks)`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Center Play Button */}
                <button
                  onClick={() => onPlayTrack(track)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl shadow-amber-500/40 transform group-hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                  {isTrackPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                {/* Bottom Counts: Views & Plays Live Count */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-zinc-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Headphones className="w-3.5 h-3.5" />
                      {track.plays.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-blue-300">
                      <Eye className="w-3.5 h-3.5" />
                      {track.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-emerald-400 font-bold font-mono">
                    ${track.cashEarned.toLocaleString()} earned
                  </div>
                </div>
              </div>

              {/* Track Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-zinc-100 line-clamp-1 hover:text-amber-400 transition">
                    {track.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={track.artistAvatar}
                      alt={track.artist}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs text-zinc-300 font-semibold">{track.artist}</span>
                    {track.crewName && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {track.crewName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tip Cash & Interaction Row */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <div className="flex items-center gap-3">
                    {/* Like */}
                    <button
                      onClick={() => handleToggleLike(track.id)}
                      className={`flex items-center gap-1 text-xs transition cursor-pointer ${
                        isLiked ? 'text-rose-500 font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{track.likes + (isLiked ? 1 : 0)}</span>
                    </button>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => setActiveCommentTrackId(isCommentOpen ? null : track.id)}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{trackComments.length}</span>
                    </button>
                  </div>

                  {/* Throw Tip Cash Button */}
                  <button
                    onClick={() => {
                      audioEngine.playCashSound();
                      onThrowCash(10, track);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow transition active:scale-95 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Tip $10</span>
                  </button>
                </div>

                {/* Inline Comments Section */}
                {isCommentOpen && (
                  <div className="border-t border-zinc-800 pt-3 space-y-2 text-xs">
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {trackComments.map((c) => (
                        <div key={c.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                            <span className="text-amber-400">{c.user}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-zinc-300 mt-0.5">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Drop feedback or hype..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(track.id)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddComment(track.id)}
                        className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

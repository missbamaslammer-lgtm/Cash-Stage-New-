import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Sparkles, 
  Play, 
  Pause, 
  Star, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  Send, 
  DollarSign, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { L4LTrack, Track, UserProfile } from '../types';
import { audioEngine } from '../services/audioService';

interface Listen4ListenViewProps {
  l4lPool: L4LTrack[];
  user: UserProfile;
  onCompleteL4L: (l4lId: string, creditsEarned: number, feedback: { rating: number; comment: string }) => void;
  onSubmitToPool: (track: Track, creditsToSpend: number) => void;
}

export const Listen4ListenView: React.FC<Listen4ListenViewProps> = ({
  l4lPool,
  user,
  onCompleteL4L,
  onSubmitToPool,
}) => {
  const [activeTrackId, setActiveTrackId] = useState<string>(l4lPool[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsListened, setSecondsListened] = useState(0);
  const requiredSeconds = 30; // 30s verified listening threshold

  // Feedback form
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Pool submission modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [creditsToOffer, setCreditsToOffer] = useState(20);

  const currentItem = l4lPool.find((item) => item.id === activeTrackId) || l4lPool[0];

  // Timer loop for verified listening
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setSecondsListened((prev) => {
          if (prev < requiredSeconds) return prev + 1;
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, requiredSeconds]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stopBeat();
      setIsPlaying(false);
    } else {
      audioEngine.startBeat(currentItem.track.beatType, currentItem.track.bpm);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (item: L4LTrack) => {
    if (item.id === activeTrackId) return;
    audioEngine.stopBeat();
    setIsPlaying(false);
    setActiveTrackId(item.id);
    setSecondsListened(0);
    setFeedbackSubmitted(false);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = () => {
    if (!feedbackComment.trim()) return;
    audioEngine.playCashSound();
    onCompleteL4L(currentItem.id, currentItem.creditsOffered, {
      rating,
      comment: feedbackComment.trim(),
    });
    setFeedbackSubmitted(true);
  };

  const progressPct = Math.min((secondsListened / requiredSeconds) * 100, 100);
  const isVerified = secondsListened >= requiredSeconds;

  return (
    <div className="space-y-8 pb-32">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-emerald-950/40 to-zinc-950 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
              <Repeat className="w-3.5 h-3.5" />
              Listen 4 Listen Exchange Pool
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Organic Artist Support & Boost Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Listen to fellow indie artists for 30 seconds, write constructive feedback, and earn <strong>Listen Credits</strong> to rocket your own tracks to the top of the Cash Stage homepage!
            </p>
          </div>

          {/* User Credits Balance */}
          <div className="bg-zinc-900 border-2 border-emerald-500/50 p-4 rounded-2xl text-center shadow-xl shadow-emerald-500/10 flex-shrink-0">
            <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">My Listen Credits</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              {user.listenCredits} PTS
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              + Submit My Song
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Verification Station & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Player & Review Station (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {currentItem && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentItem.track.coverArt}
                    alt={currentItem.track.title}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Reward: +{currentItem.creditsOffered} Credits
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">{currentItem.track.title}</h3>
                    <p className="text-xs text-zinc-400">By {currentItem.track.artist} ({currentItem.track.genre})</p>
                  </div>
                </div>

                {/* Big Play Button */}
                <button
                  onClick={handleTogglePlay}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  <span>{isPlaying ? 'Pause Track' : 'Start 30s Listen'}</span>
                </button>
              </div>

              {/* 30s Anti-Skip Verification Meter */}
              <div className="space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Verified Listening Progress
                  </span>
                  <span className={isVerified ? 'text-emerald-400 font-mono font-black' : 'text-amber-400 font-mono'}>
                    {secondsListened}/{requiredSeconds}s {isVerified && '✓ VERIFIED'}
                  </span>
                </div>
                <div className="h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isVerified ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {isVerified
                    ? '🎉 Verification complete! Please leave constructive feedback below to claim your credits.'
                    : '⏳ Keep listening to unlock feedback and claim reward.'}
                </p>
              </div>

              {/* Constructive Review / Feedback Form */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-zinc-200">
                  Leave Verified Artist Review
                </h4>

                {feedbackSubmitted ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="font-bold text-white">+{currentItem.creditsOffered} Credits Credited to Your Account!</h5>
                    <p className="text-xs text-zinc-400">
                      Your feedback was posted to the artist's review board. Thank you for supporting the indie community!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 cursor-pointer transition"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= rating ? 'text-amber-400 fill-current' : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-400 ml-2">{rating}/5 Stars</span>
                    </div>

                    {/* Feedback textarea */}
                    <textarea
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      disabled={!isVerified}
                      placeholder={
                        isVerified
                          ? 'Write constructive thoughts on the flow, beat, delivery, or mix...'
                          : 'Listen for 30s to unlock feedback submission...'
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!isVerified || !feedbackComment.trim()}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                        isVerified && feedbackComment.trim()
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Review & Claim +{currentItem.creditsOffered} Credits</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: L4L Exchange Queue */}
        <div className="space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center justify-between">
              <span>Exchange Pool Queue</span>
              <span className="text-xs text-emerald-400 font-mono">{l4lPool.length} Active</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {l4lPool.map((item) => {
                const isSelected = item.id === activeTrackId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectTrack(item)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={item.track.coverArt}
                      alt={item.track.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{item.track.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{item.track.artist}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-emerald-400 font-bold">+{item.creditsOffered} PTS</span>
                        <span className="text-zinc-500">{item.listensCompleted}/{item.listensRequired} listened</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Submit My Track to L4L Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">Boost Track in L4L Pool</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-300">
                Put your song into the Listen 4 Listen rotation. Other verified creators will stream your song for 30s and submit feedback.
              </p>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Select Track</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white">
                  <option>Cash Stage Anthem (Dirty South Mix)</option>
                  <option>Queen of the Dirty South</option>
                  <option>Studio Session Take #1</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">
                  Credits to Spend ({user.listenCredits} Available)
                </label>
                <input
                  type="number"
                  min="10"
                  max={user.listenCredits}
                  value={creditsToOffer}
                  onChange={(e) => setCreditsToOffer(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <button
                onClick={() => {
                  alert('Your track has been pushed to the Listen 4 Listen Pool rotation!');
                  setShowSubmitModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition cursor-pointer"
              >
                Confirm & Boost Song
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

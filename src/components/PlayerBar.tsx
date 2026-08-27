import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  DollarSign, 
  Flame, 
  Radio, 
  FileText, 
  Ban, 
  Sparkles,
  Music2,
  X
} from 'lucide-react';
import { Track } from '../types';
import { audioEngine } from '../services/audioService';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onThrowCash: (amount: number, track: Track) => void;
  onBlockArtist: (artistName: string, artistAvatar: string) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onThrowCash,
  onBlockArtist,
}) => {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [floatingBills, setFloatingBills] = useState<{ id: number; x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 24) - 2;
      let x = 0;

      for (let i = 0; i < 24; i++) {
        // Generate dynamic or analysed bar height
        let barHeight = isPlaying ? (dataArray[i % bufferLength] / 255) * canvas.height * 0.85 : 4;
        if (isPlaying && barHeight < 6) {
          barHeight = Math.sin(Date.now() / 150 + i) * 8 + 12;
        }

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#eab308');
        gradient.addColorStop(1, '#10b981');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Track simulated progress timer
  useEffect(() => {
    let timer: number;
    if (isPlaying && currentTrack) {
      timer = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            onNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, onNextTrack]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAirhorn = () => {
    audioEngine.playAirhorn();
  };

  const handleThrowCash = () => {
    if (!currentTrack) return;
    audioEngine.playCashSound();
    onThrowCash(10, currentTrack);

    // Spawn floating bills animation
    const newBill = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 80,
    };
    setFloatingBills((prev) => [...prev, newBill]);
    setTimeout(() => {
      setFloatingBills((prev) => prev.filter((b) => b.id !== newBill.id));
    }, 1500);
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Floating Cash Bills FX */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingBills.map((bill) => (
          <div
            key={bill.id}
            style={{ left: `${bill.x}%`, bottom: '100px' }}
            className="absolute animate-bounce flex items-center gap-1 bg-emerald-600 text-white font-black px-3 py-1.5 rounded-full shadow-2xl border-2 border-yellow-300 text-sm transform -translate-x-1/2 transition-all duration-1000"
          >
            <DollarSign className="w-4 h-4 text-yellow-300" />
            +$10 CASH TIP! 🔥
          </div>
        ))}
      </div>

      {/* Synced Lyrics Modal Drawer */}
      {showLyrics && (
        <div className="fixed inset-x-0 bottom-24 z-40 max-w-2xl mx-auto px-4">
          <div className="bg-zinc-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-200">
                  Lyrics: <span className="text-amber-300">{currentTrack.title}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-line">
              {currentTrack.lyrics || 'No official lyrics uploaded for this track yet.'}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-amber-500/20 text-white shadow-2xl px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Track Details & Cover */}
          <div className="flex items-center gap-3 w-full md:w-1/4 justify-between md:justify-start">
            <div className="relative group flex-shrink-0">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-amber-500/40 shadow-md"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                  {currentTrack.title}
                </h4>
                {currentTrack.isBamaSlammerOfficial && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 uppercase flex-shrink-0">
                    Bama
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="truncate text-amber-400 font-medium">{currentTrack.artist}</span>
                <span>•</span>
                <span className="text-zinc-500">{currentTrack.genre}</span>
              </div>
            </div>

            {/* Quick Block Artist Button on Player */}
            <button
              onClick={() => onBlockArtist(currentTrack.artist, currentTrack.artistAvatar)}
              className="md:hidden text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition"
              title={`Block ${currentTrack.artist}`}
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Controls & Audio Progress */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrevTrack}
                className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition cursor-pointer font-bold"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={onNextTrack}
                className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Real-time Web Audio Visualizer */}
              <canvas
                ref={canvasRef}
                width={120}
                height={26}
                className="hidden sm:block rounded bg-zinc-900/80 px-1 py-0.5 border border-zinc-800"
              />
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
              <span>{formatTime(progress)}</span>
              <div 
                className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPct = clickX / rect.width;
                  setProgress(newPct * currentTrack.duration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                  style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                />
              </div>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Right: Stage FX & Tipping & Block & Lyrics */}
          <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
            {/* Airhorn Button */}
            <button
              onClick={handleAirhorn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-xs font-bold transition active:scale-90 cursor-pointer"
              title="Play Airhorn Sound Effect"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Airhorn</span>
            </button>

            {/* Throw $10 Cash Button */}
            <button
              onClick={handleThrowCash}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
              title="Throw $10 Cash to Artist on Stage"
            >
              <DollarSign className="w-3.5 h-3.5 text-yellow-300" />
              <span>Throw $10</span>
            </button>

            {/* Toggle Lyrics */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                showLyrics 
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold' 
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
              }`}
              title="Toggle Lyrics"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Block Artist Button (Desktop) */}
            <button
              onClick={() => onBlockArtist(currentTrack.artist, currentTrack.artistAvatar)}
              className="hidden md:flex p-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/40 transition cursor-pointer"
              title={`Block ${currentTrack.artist}`}
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

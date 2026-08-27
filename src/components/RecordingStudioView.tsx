import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Sliders, 
  Sparkles, 
  Music, 
  FileEdit, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Volume2, 
  VolumeX, 
  Radio, 
  UploadCloud, 
  Disc,
  RotateCcw,
  Zap,
  Tag
} from 'lucide-react';
import { StudioBeat, Track } from '../types';
import { STUDIO_BEATS } from '../data/initialData';
import { audioEngine } from '../services/audioService';

interface RecordingStudioViewProps {
  onPublishTrack: (newTrack: Track) => void;
}

export const RecordingStudioView: React.FC<RecordingStudioViewProps> = ({ onPublishTrack }) => {
  const [selectedBeat, setSelectedBeat] = useState<StudioBeat>(STUDIO_BEATS[0]);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // FX Controls
  const [reverbLevel, setReverbLevel] = useState(35);
  const [vocalGain, setVocalGain] = useState(85);
  const [bpm, setBpm] = useState(selectedBeat.bpm);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  // Rhyme Pad / Lyrics Teleprompter
  const [lyricsText, setLyricsText] = useState(`[Verse 1]
Step in the booth, Alabama Slammer on the beat
Cash Stage crown, we never face defeat
Stack up the green, let the 808s roll
Putting all my soul into this microphone control...`);
  const [rhymeWord, setRhymeWord] = useState('');
  const [rhymeSuggestions, setRhymeSuggestions] = useState<string[]>([]);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [trackTitle, setTrackTitle] = useState('New Cash Stage Anthem');
  const [trackGenre, setTrackGenre] = useState<Track['genre']>('Southern Rap');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Canvas visualizer ref
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync beat BPM when selected beat changes
  useEffect(() => {
    setBpm(selectedBeat.bpm);
    if (isBeatPlaying) {
      audioEngine.startBeat(selectedBeat.id, selectedBeat.bpm);
    }
  }, [selectedBeat]);

  // Metronome loop
  useEffect(() => {
    let metronomeTimer: number;
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      let count = 0;
      metronomeTimer = window.setInterval(() => {
        audioEngine.playMetronomeClick(count % 4 === 0);
        count++;
      }, intervalMs);
    }
    return () => clearInterval(metronomeTimer);
  }, [isMetronomeActive, bpm]);

  // Recording timer
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Visualizer animation
  useEffect(() => {
    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 32;
      const barWidth = canvas.width / numBars;
      let x = 0;

      for (let i = 0; i < numBars; i++) {
        let barHeight = (dataArray[i * 2] / 255) * canvas.height;
        if (isRecording || isBeatPlaying) {
          barHeight = Math.max(barHeight, Math.random() * 15 + 5);
        } else {
          barHeight = 2;
        }

        ctx.fillStyle = isRecording
          ? `rgb(${Math.min(255, barHeight * 4)}, 50, 50)`
          : '#eab308';

        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isRecording, isBeatPlaying]);

  // Beat Play/Stop
  const toggleBeat = () => {
    if (isBeatPlaying) {
      audioEngine.stopBeat();
      setIsBeatPlaying(false);
    } else {
      audioEngine.startBeat(selectedBeat.id, bpm);
      setIsBeatPlaying(true);
    }
  };

  // Live Mic Recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (isBeatPlaying) {
        audioEngine.stopBeat();
        setIsBeatPlaying(false);
      }
      const audioUrl = await audioEngine.stopRecording();
      setRecordedUrl(audioUrl);
    } else {
      // Start recording
      setRecordingSeconds(0);
      setRecordedUrl(null);
      const started = await audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
        // Also auto-start beat for backing track
        if (!isBeatPlaying) {
          audioEngine.startBeat(selectedBeat.id, bpm);
          setIsBeatPlaying(true);
        }
      } else {
        alert('Microphone access is needed to record vocals. Please ensure microphone permissions are allowed in your browser.');
      }
    }
  };

  // Find Rhymes Helper
  const handleFindRhymes = () => {
    if (!rhymeWord.trim()) return;
    const w = rhymeWord.toLowerCase().trim();
    const commonRhymes: Record<string, string[]> = {
      beat: ['heat', 'street', 'defeat', 'elite', 'fleet', 'meet', 'feet'],
      cash: ['flash', 'stash', 'splash', 'dash', 'smash', 'clash', 'crash'],
      stage: ['rage', 'page', 'cage', 'gauge', 'wage', 'sage'],
      crown: ['town', 'down', 'frown', 'brown', 'sound', 'ground'],
      mic: ['strike', 'like', 'hype', 'tight', 'flight', 'night'],
      south: ['mouth', 'out', 'shout', 'route', 'doubt'],
    };

    const found = commonRhymes[w] || [
      `${w}er`,
      `high-${w}`,
      `deep ${w}`,
      `real ${w}`,
      `pure ${w}`,
    ];
    setRhymeSuggestions(found);
  };

  // Publish Recording
  const handlePublish = () => {
    if (!trackTitle.trim()) return;

    const newTrack: Track = {
      id: `trk_${Date.now()}`,
      title: trackTitle.trim(),
      artist: 'Alabama Slammer',
      artistId: 'art_bama',
      artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      duration: Math.max(recordingSeconds, 120),
      genre: trackGenre,
      beatType: selectedBeat.id,
      bpm: bpm,
      key: selectedBeat.key,
      plays: 1,
      cashEarned: 50.00, // Instant sign-on boost
      likes: 3,
      lyrics: lyricsText,
      isBamaSlammerOfficial: true,
      crewName: 'Bama Slammer Mob',
      releaseDate: '2026-08-23',
    };

    onPublishTrack(newTrack);
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setShowPublishModal(false);
    }, 1500);
  };

  const formatSecs = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Mic className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Cash Stage DAW & Vocal Booth</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                PRO STUDIO
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Multi-track recording, backing 808s, lyrics teleprompter & punch-in vocal engine.
            </p>
          </div>
        </div>

        {/* Master Studio Transport Bar */}
        <div className="flex items-center gap-3">
          {/* Record Button */}
          <button
            onClick={handleToggleRecord}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition shadow-lg cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-red-600/40'
                : 'bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-500/30'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{isRecording ? `REC (${formatSecs(recordingSeconds)})` : 'Punch In (Rec)'}</span>
          </button>

          {/* Beat Play Button */}
          <button
            onClick={toggleBeat}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            {isBeatPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isBeatPlaying ? 'Stop Beat' : 'Test Beat'}</span>
          </button>

          {/* Publish / Export Mix Button */}
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={recordingSeconds === 0 && !recordedUrl}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black transition cursor-pointer ${
              recordingSeconds > 0 || recordedUrl
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            <span>Release Track</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Beat Selector & Backing Stems */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400" />
                Select Backing Beat
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">{STUDIO_BEATS.length} Loaded</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {STUDIO_BEATS.map((beat) => {
                const isSelected = selectedBeat.id === beat.id;
                return (
                  <div
                    key={beat.id}
                    onClick={() => {
                      setSelectedBeat(beat);
                      audioEngine.playCashSound();
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{beat.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Prod. {beat.producer}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                          {beat.bpm} BPM
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                          {beat.key}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected && isBeatPlaying) {
                          audioEngine.stopBeat();
                          setIsBeatPlaying(false);
                        } else {
                          setSelectedBeat(beat);
                          audioEngine.startBeat(beat.id, beat.bpm);
                          setIsBeatPlaying(true);
                        }
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isSelected && isBeatPlaying
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {isSelected && isBeatPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio FX & Metronome Control */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Audio FX & Tempo Engine
            </h3>

            {/* Metronome */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-200">Metronome Click</span>
              </div>
              <button
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isMetronomeActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {isMetronomeActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* BPM Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                <span>Tempo (BPM)</span>
                <span className="font-mono text-amber-400">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="70"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Vocal Gain */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                <span>Vocal Mic Gain</span>
                <span className="font-mono text-amber-400">{vocalGain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vocalGain}
                onChange={(e) => setVocalGain(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Studio Reverb */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                <span>Vocal Reverb & Space</span>
                <span className="font-mono text-amber-400">{reverbLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reverbLevel}
                onChange={(e) => setReverbLevel(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Center & Right Column: Vocal Waveform & Rhyme Book Teleprompter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Visualizer Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-200">Live Vocal Waveform & Monitor</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-zinc-600'}`} />
                <span>{isRecording ? 'RECORDING LIVE' : 'STANDBY'}</span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 p-2">
              <canvas
                ref={visualizerCanvasRef}
                width={600}
                height={120}
                className="w-full h-32 rounded"
              />

              {recordedUrl && !isRecording && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center gap-4 p-4">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-white">Vocal Take Captured ({formatSecs(recordingSeconds)})</div>
                    <div className="flex items-center gap-2">
                      <audio controls src={recordedUrl} className="h-8 max-w-xs" />
                      <button
                        onClick={() => {
                          setRecordedUrl(null);
                          setRecordingSeconds(0);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        title="Retake"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rhyme Book & Lyrics Teleprompter */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-200">Lyrics Teleprompter & Rhyme Scratchpad</h3>
              </div>
              <span className="text-[10px] text-zinc-400">Scrollable in booth</span>
            </div>

            {/* Rhyme Finder Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type word to find rhymes (e.g. cash, beat, mic, stage)..."
                value={rhymeWord}
                onChange={(e) => setRhymeWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFindRhymes()}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleFindRhymes}
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
              >
                Find Rhymes
              </button>
            </div>

            {/* Rhyme suggestions chips */}
            {rhymeSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase mr-1">Suggestions:</span>
                {rhymeSuggestions.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setLyricsText((prev) => `${prev} ${r}`)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-300 text-xs border border-zinc-700 transition"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Teleprompter Textarea */}
            <textarea
              rows={8}
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
              placeholder="Write your bars here for live reading during the take..."
            />
          </div>

        </div>

      </div>

      {/* Publish Track Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">Release to Cash Stage</h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {publishSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Track Published to Cash Stage!</h4>
                <p className="text-xs text-zinc-400">
                  Your new track is now live in the stream and eligible for Cash Battles and L4L Boosts!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Song Title</label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Genre Category</label>
                  <select
                    value={trackGenre}
                    onChange={(e) => setTrackGenre(e.target.value as Track['genre'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Southern Rap">Southern Rap</option>
                    <option value="Trap">Trap</option>
                    <option value="Drill">Drill</option>
                    <option value="R&B">R&B</option>
                    <option value="Hip Hop">Hip Hop</option>
                  </select>
                </div>

                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Backing Beat:</span>
                    <strong className="text-zinc-200">{selectedBeat.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo:</span>
                    <strong className="text-zinc-200">{bpm} BPM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sign-on Bonus:</span>
                    <strong className="text-emerald-400">+$50.00 Cash Pot Credit</strong>
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  Confirm & Release Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

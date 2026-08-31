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
  Tag,
  Users,
  Swords,
  Layers,
  Wand2,
  Lock,
  Headphones,
  Plus
} from 'lucide-react';
import { StudioBeat, Track } from '../types';
import { INITIAL_BEATS } from '../data/initialData';
import { audioEngine } from '../services/audioService';

interface RecordingStudioViewProps {
  onPublishTrack: (newTrack: Track) => void;
}

export const RecordingStudioView: React.FC<RecordingStudioViewProps> = ({ onPublishTrack }) => {
  const [selectedBeat, setSelectedBeat] = useState<StudioBeat>(INITIAL_BEATS[0]);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Drop Format & Time Cap Constraints
  // Solo = 120s max (2 min), Collab = 360s max (6 min), Battle = 180s max (3 min)
  const [dropFormat, setDropFormat] = useState<'solo' | 'collab' | 'battle'>('solo');
  const maxAllowedSeconds = dropFormat === 'solo' ? 120 : dropFormat === 'collab' ? 360 : 180;

  // Voloco / Rap Fame Autotune & FX Presets
  const [vocalPreset, setVocalPreset] = useState<
    'hard_tune' | 'warm_vintage' | 'modern_trap' | 'lofi_radio' | 'robot_vocoder' | 'clean_studio'
  >('hard_tune');
  const [selectedKey, setSelectedKey] = useState('F Minor');
  const [tuneCorrectionAmount, setTuneCorrectionAmount] = useState(90); // 0 - 100%
  const [reverbLevel, setReverbLevel] = useState(40);
  const [delayLevel, setDelayLevel] = useState(25);

  // Stems Multi-Track Volumes
  const [beatVolume, setBeatVolume] = useState(80);
  const [leadVocalVolume, setLeadVocalVolume] = useState(95);
  const [adlibVolume, setAdlibVolume] = useState(75);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  // Collab Settings
  const [inviteToCollab, setInviteToCollab] = useState(true);
  const [collabArtistName, setCollabArtistName] = useState('');
  const [taggedCollaborators, setTaggedCollaborators] = useState<string[]>(['Metro South']);

  // Rhyme Pad / Lyrics Teleprompter
  const [lyricsText, setLyricsText] = useState(`[Verse 1 - Bama Slammer]
Step in the vocal booth, Voloco tune locked tight
Cash Stage microphone glowing through the night
Southern heavy 808s shaking Mobile down
48-hour battle champion wearing the crown!

[Chorus]
Count the stage cash, stack the coins high
Southern rap royalty never gonna die!`);
  const [rhymeWord, setRhymeWord] = useState('tight');
  const [rhymeSuggestions, setRhymeSuggestions] = useState<string[]>([
    'night', 'fight', 'sight', 'light', 'bright', 'height', 'ignite', 'mic'
  ]);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [trackTitle, setTrackTitle] = useState('Cash Stage 808 Heat');
  const [trackGenre, setTrackGenre] = useState<Track['genre']>('Southern Rap');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Canvas visualizer ref
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Switch BPM when beat changes
  useEffect(() => {
    setSelectedKey(selectedBeat.key);
    if (isBeatPlaying) {
      audioEngine.startBeat(selectedBeat.id, selectedBeat.bpm);
    }
  }, [selectedBeat]);

  // Metronome loop
  useEffect(() => {
    let metronomeTimer: number;
    if (isMetronomeActive) {
      const intervalMs = (60 / selectedBeat.bpm) * 1000;
      let count = 0;
      metronomeTimer = window.setInterval(() => {
        audioEngine.playMetronomeClick(count % 4 === 0);
        count++;
      }, intervalMs);
    }
    return () => clearInterval(metronomeTimer);
  }, [isMetronomeActive, selectedBeat.bpm]);

  // Recording Timer with Strict Max Duration Enforcement
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= maxAllowedSeconds) {
            // Auto stop when limit is hit!
            handleStopRecording();
            audioEngine.playBattleBell();
            return maxAllowedSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, maxAllowedSeconds]);

  // Audio Visualizer Canvas Loop
  useEffect(() => {
    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#eab308');
        gradient.addColorStop(1, '#ef4444');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleBeat = () => {
    if (isBeatPlaying) {
      audioEngine.stopBeat();
      setIsBeatPlaying(false);
    } else {
      audioEngine.startBeat(selectedBeat.id, selectedBeat.bpm);
      setIsBeatPlaying(true);
    }
  };

  const handleStartRecording = async () => {
    audioEngine.playCashSound();
    setRecordingSeconds(0);
    setRecordedUrl(null);
    const success = await audioEngine.startRecording();
    if (success) {
      setIsRecording(true);
      if (!isBeatPlaying) {
        audioEngine.startBeat(selectedBeat.id, selectedBeat.bpm);
        setIsBeatPlaying(true);
      }
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const url = await audioEngine.stopRecording();
    setRecordedUrl(url || 'recorded_mock_stem_url');
    audioEngine.stopBeat();
    setIsBeatPlaying(false);
    audioEngine.playCashSound();
  };

  const handleTogglePlayRecorded = () => {
    if (isPlayingRecorded) {
      audioEngine.stopBeat();
      setIsPlayingRecorded(false);
    } else {
      audioEngine.startBeat(selectedBeat.id, selectedBeat.bpm);
      setIsPlayingRecorded(true);
    }
  };

  const handleRhymeSearch = (word: string) => {
    setRhymeWord(word);
    const commonRhymes: Record<string, string[]> = {
      heat: ['beat', 'street', 'feet', 'seat', 'elite', 'compete', 'defeat'],
      cash: ['dash', 'flash', 'smash', 'clash', 'stash', 'splash'],
      bama: ['hammer', 'slammer', 'grammar', 'glamour', 'stammer'],
      rap: ['trap', 'clap', 'map', 'snap', 'slap', 'strap'],
      king: ['ring', 'sing', 'wing', 'bring', 'swing', 'bling'],
      flame: ['game', 'fame', 'name', 'claim', 'aim', 'shame'],
      south: ['mouth', 'doubt', 'shout', 'route', 'out'],
    };
    const key = word.toLowerCase().trim();
    if (commonRhymes[key]) {
      setRhymeSuggestions(commonRhymes[key]);
    } else {
      setRhymeSuggestions(['flow', 'glow', 'show', 'blow', 'row', 'pro']);
    }
  };

  const handleAddCollaborator = () => {
    if (collabArtistName.trim() && !taggedCollaborators.includes(collabArtistName.trim())) {
      setTaggedCollaborators([...taggedCollaborators, collabArtistName.trim()]);
      setCollabArtistName('');
    }
  };

  const handlePublish = () => {
    const finalDuration = recordingSeconds > 0 ? recordingSeconds : maxAllowedSeconds;

    const newTrack: Track = {
      id: `trk_${Date.now()}`,
      title: trackTitle,
      artist: dropFormat === 'collab' && taggedCollaborators.length > 0 
        ? `Alabama Slammer ft. ${taggedCollaborators.join(', ')}`
        : 'Alabama Slammer',
      artistId: 'usr_me_01',
      artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      duration: finalDuration,
      dropType: dropFormat,
      genre: trackGenre,
      beatType: selectedBeat.id,
      bpm: selectedBeat.bpm,
      key: selectedKey,
      plays: 1,
      views: 12,
      cashEarned: 0,
      likes: 0,
      lyrics: lyricsText,
      isBamaSlammerOfficial: true,
      crewName: 'Bama Slammer Mob',
      releaseDate: new Date().toISOString().split('T')[0],
      collabOpen: inviteToCollab,
      collabArtists: dropFormat === 'collab' ? ['Alabama Slammer', ...taggedCollaborators] : undefined,
    };

    onPublishTrack(newTrack);
    setPublishSuccess(true);
    setTimeout(() => {
      setShowPublishModal(false);
      setPublishSuccess(false);
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Studio Banner & Mode Selector */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/50 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Pro Vocal DAW & Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/40">
                  Voloco / BandLab Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Multi-track autotune recording, pitch snap, teleprompter, and strict duration format limits
              </p>
            </div>
          </div>

          {/* Format Selector: Solo (2 min) | Collab (6 min) | Battle (3 min max) */}
          <div className="bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => setDropFormat('solo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                dropFormat === 'solo'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Solo (Max 2m)</span>
            </button>

            <button
              onClick={() => setDropFormat('collab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                dropFormat === 'collab'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Collab (Max 6m)</span>
            </button>

            <button
              onClick={() => setDropFormat('battle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                dropFormat === 'battle'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battle (Max 3m)</span>
            </button>
          </div>
        </div>

        {/* Live Recording Timeline & Waveform Bar */}
        <div className="bg-zinc-950/90 rounded-2xl p-4 border border-zinc-800/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-zinc-600'}`} />
              <span className="font-bold text-zinc-200 uppercase font-mono">
                {isRecording ? 'RECORDING IN PROGRESS' : recordedUrl ? 'AUDIO RECORDED' : 'READY TO RECORD'}
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                ({dropFormat.toUpperCase()} CAP: {formatTime(maxAllowedSeconds)})
              </span>
            </div>

            <div className="font-mono text-sm font-black text-amber-300">
              {formatTime(recordingSeconds)} / {formatTime(maxAllowedSeconds)}
            </div>
          </div>

          {/* Progress Bar of Time Limit */}
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className={`h-full transition-all duration-300 ${
                recordingSeconds >= maxAllowedSeconds * 0.85
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(100, (recordingSeconds / maxAllowedSeconds) * 100)}%` }}
            />
          </div>

          {/* Canvas Spectrum Visualizer */}
          <div className="h-20 w-full bg-zinc-900/60 rounded-xl overflow-hidden border border-zinc-800 relative">
            <canvas ref={visualizerCanvasRef} width={800} height={100} className="w-full h-full" />
            <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-500 bg-black/60 px-2 py-0.5 rounded">
              REAL-TIME ANALYSER
            </div>
          </div>

          {/* Master Transport Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Vocal Take</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs shadow-lg transition cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop & Save Stem</span>
                </button>
              )}

              <button
                onClick={handleToggleBeat}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                  isBeatPlaying
                    ? 'bg-amber-500 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
                }`}
              >
                {isBeatPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isBeatPlaying ? 'Pause Beat' : 'Preview Beat'}</span>
              </button>

              {recordedUrl && (
                <button
                  onClick={handleTogglePlayRecorded}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                    isPlayingRecorded
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-zinc-800'
                  }`}
                >
                  {isPlayingRecorded ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>Play Mix</span>
                </button>
              )}
            </div>

            {/* Metronome & Publish Action */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isMetronomeActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="Metronome Click"
              >
                <Activity className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPublishModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/30 transition cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <UploadCloud className="w-4 h-4 text-zinc-950" />
                <span>Publish Drop to Stage</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Voloco / Rap Fame Autotune & FX Rack */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Voloco Vocal FX Rack</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">HARD PITCH SNAP</span>
          </div>

          {/* Autotune Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">Vocal Effect Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hard_tune', label: '🔥 Hard Auto-Tune', desc: 'Travis / T-Pain Pitch' },
                { id: 'modern_trap', label: '⚡ Trap Double', desc: 'Wide chorus & saturation' },
                { id: 'warm_vintage', label: '📻 Warm Tube', desc: 'Smooth analog warmth' },
                { id: 'lofi_radio', label: '🎙️ Radio Lo-Fi', desc: 'Telephone bandpass' },
                { id: 'robot_vocoder', label: '🤖 Robot Vocoder', desc: 'Synthetic harmonics' },
                { id: 'clean_studio', label: '✨ Clean Studio', desc: 'Pure broadcast vocal' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setVocalPreset(preset.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    vocalPreset === preset.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 shadow-inner'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-zinc-200">{preset.label}</span>
                  <span className="text-[9px] text-zinc-400 block">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key & Scale Snap */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">Pitch Correction Key</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['F Minor', 'C Minor', 'Eb Major', 'G# Minor', 'A Minor', 'D Minor'].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKey(k)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                    selectedKey === k
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Tuning Intensity Slider */}
          <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-bold">Auto-Tune Strength</span>
              <span className="font-mono text-amber-400 font-bold">{tuneCorrectionAmount}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={tuneCorrectionAmount}
              onChange={(e) => setTuneCorrectionAmount(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Reverb & Delay */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-bold">Reverb</span>
                <span className="font-mono text-amber-400">{reverbLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reverbLevel}
                onChange={(e) => setReverbLevel(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-bold">Echo / Delay</span>
                <span className="font-mono text-amber-400">{delayLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={delayLevel}
                onChange={(e) => setDelayLevel(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Middle Column: Multi-Track Stems Mixer (BandLab style) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Multi-Track Stem Console</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">3 STEMS ACTIVE</span>
          </div>

          {/* Stem 1: Instrumental Beat */}
          <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-zinc-200">Track 1: 808 Instrumental Beat</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">{selectedBeat.bpm} BPM</span>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={beatVolume}
                onChange={(e) => setBeatVolume(Number(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-400 w-8">{beatVolume}%</span>
            </div>
          </div>

          {/* Stem 2: Lead Vocal */}
          <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs font-bold text-zinc-200">Track 2: Lead Vocal (Pitch Corrected)</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">SNAP ON</span>
            </div>

            <div className="flex items-center gap-3">
              <Mic className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={leadVocalVolume}
                onChange={(e) => setLeadVocalVolume(Number(e.target.value))}
                className="flex-1 accent-rose-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-400 w-8">{leadVocalVolume}%</span>
            </div>
          </div>

          {/* Stem 3: Ad-libs & Doubles */}
          <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs font-bold text-zinc-200">Track 3: Ad-libs & Hype Doubles</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">STEREO WIDE</span>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={adlibVolume}
                onChange={(e) => setAdlibVolume(Number(e.target.value))}
                className="flex-1 accent-purple-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-400 w-8">{adlibVolume}%</span>
            </div>
          </div>

          {/* Select Beat Catalog */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-zinc-300 block">Loaded 808 Instrumental</label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {INITIAL_BEATS.map((beat) => (
                <div
                  key={beat.id}
                  onClick={() => setSelectedBeat(beat)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedBeat.id === beat.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{beat.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      Prod. {beat.producer} • {beat.bpm} BPM • {beat.key}
                    </div>
                  </div>
                  {selectedBeat.id === beat.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Rap Fame Teleprompter & Rhyme Assistant */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 font-black text-sm text-white">
                <FileEdit className="w-4 h-4 text-amber-400" />
                <span>Lyrics Teleprompter & Scratchpad</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">RHYME ENGINE</span>
            </div>

            {/* Lyrics Editor Area */}
            <textarea
              rows={7}
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs sm:text-sm text-zinc-100 font-sans focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
              placeholder="Write your bars here..."
            />

            {/* Rhyme Assistant */}
            <div className="space-y-2 bg-zinc-900/70 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-bold">Rhyme Dictionary</span>
                <span className="text-[10px] text-zinc-400">Type a word below</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={rhymeWord}
                  onChange={(e) => handleRhymeSearch(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="e.g. cash, beat, slammer"
                />
              </div>

              {/* Rhyme Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rhymeSuggestions.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setLyricsText((prev) => `${prev} ${w}`)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 font-mono transition cursor-pointer border border-zinc-700"
                  >
                    +{w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Collab Options on Studio Floor */}
          <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Invite to Collab</span>
              </div>
              <button
                onClick={() => setInviteToCollab(!inviteToCollab)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase transition cursor-pointer border ${
                  inviteToCollab
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                {inviteToCollab ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
              </button>
            </div>

            {inviteToCollab && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={collabArtistName}
                    onChange={(e) => setCollabArtistName(e.target.value)}
                    placeholder="Tag artist / producer handle..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddCollaborator}
                    className="p-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {taggedCollaborators.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono">
                      @{c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Track Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">Publish Drop to Cash Stage</h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {publishSuccess ? (
              <div className="py-8 text-center space-y-2 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-black text-lg text-white">Drop Published Live!</h4>
                <p className="text-xs text-zinc-400">
                  Your track is now streaming on the Cash Stage live feed!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400">Track Title</label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Drop Category</label>
                    <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase text-amber-400">
                      {dropFormat} Drop (Max {formatTime(maxAllowedSeconds)})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Primary Genre</label>
                    <select
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
                    >
                      <option value="Southern Rap">Southern Rap</option>
                      <option value="Trap">Trap</option>
                      <option value="Drill">Drill</option>
                      <option value="R&B">R&B</option>
                      <option value="Hip Hop">Hip Hop</option>
                      <option value="Soul">Soul</option>
                    </select>
                  </div>
                </div>

                {/* Collab Status */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold">Invite to Collab Setting:</span>
                  <span className={`font-mono font-black ${inviteToCollab ? 'text-purple-400' : 'text-zinc-500'}`}>
                    {inviteToCollab ? 'OPEN FOR COLLABS' : 'CLOSED'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePublish}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    Confirm & Publish to Cash Stage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

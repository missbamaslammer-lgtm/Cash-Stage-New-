/**
 * Audio Service for Cash Stage by Bama Slammer
 * Handles Web Audio API beat generation, sound effects, and microphone recording
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBeat = false;
  private currentBeatInterval: number | null = null;
  private currentBpm = 140;
  private activeBeatId: string | null = null;
  private currentStep = 0;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedAudioUrl: string | null = null;
  private micStream: MediaStream | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode {
    const ctx = this.getContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
    }
    return this.analyser;
  }

  // Sound Effects
  public playCashSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Dual high metallic chime for "Cha-Ching"
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.15); // E7

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {
      // Ignore audio failure
    }
  }

  public playAirhorn() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [
        { f: 466.16, start: 0, dur: 0.15 },
        { f: 466.16, start: 0.18, dur: 0.15 },
        { f: 466.16, start: 0.36, dur: 0.15 },
        { f: 370.00, start: 0.54, dur: 0.15 },
        { f: 466.16, start: 0.72, dur: 0.45 },
      ];

      notes.forEach(({ f, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + start);

        gain.gain.setValueAtTime(0.25, now + start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch {
      // Audio fallback
    }
  }

  public playMetronomeClick(accent = false) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(accent ? 1200 : 800, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Fail safely
    }
  }

  // Instrument Synth Modules
  private playKick(time: number) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.getAnalyser());
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playSnare(time: number) {
    const ctx = this.getContext();
    // Noise buffer for snap
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getAnalyser());
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playHiHat(time: number, open = false) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'highpass' as unknown as OscillatorType;
    // Metallic high frequency
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;

    const dur = open ? 0.2 : 0.04;
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.frequency.setValueAtTime(7000, time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playBass808(time: number, freq = 45) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(gain);
    gain.connect(this.getAnalyser());
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.65);
  }

  private playMelody(time: number, note = 440, type: OscillatorType = 'triangle') {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(note, time);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.getAnalyser());
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  // Beat Looper Engine
  public startBeat(beatId: string, bpm = 140) {
    this.stopBeat();
    this.activeBeatId = beatId;
    this.currentBpm = bpm;
    this.isPlayingBeat = true;
    this.currentStep = 0;

    const stepDuration = (60 / this.currentBpm) / 4; // 16th note in seconds
    const intervalMs = stepDuration * 1000;

    const stepTick = () => {
      if (!this.isPlayingBeat) return;
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const s = this.currentStep % 16;

      // Trap / Southern Rap Pattern
      if (beatId.includes('trap') || beatId.includes('slammer') || beatId.includes('drill')) {
        // Kick on 0, 6, 10
        if (s === 0 || s === 6 || s === 10) this.playKick(now);
        // Snare/Clap on 4, 12
        if (s === 4 || s === 12) this.playSnare(now);
        // Hihat on all even, plus rolls on 14, 15
        if (s % 2 === 0 || s === 14 || s === 15) this.playHiHat(now, s === 12);
        // 808 Bass slides
        if (s === 0) this.playBass808(now, 43.65); // F1
        if (s === 6) this.playBass808(now, 48.99); // G1
        if (s === 10) this.playBass808(now, 38.89); // D#1
        // Melody lead
        if (s === 0) this.playMelody(now, 349.23, 'sawtooth'); // F4
        if (s === 3) this.playMelody(now, 392.00, 'sawtooth'); // G4
        if (s === 8) this.playMelody(now, 440.00, 'sawtooth'); // A4
        if (s === 11) this.playMelody(now, 349.23, 'sawtooth');
      } else if (beatId.includes('rnb') || beatId.includes('soul')) {
        // Smooth R&B
        if (s === 0 || s === 8) this.playKick(now);
        if (s === 4 || s === 12) this.playSnare(now);
        if (s % 2 === 0) this.playHiHat(now, s === 6 || s === 14);
        if (s === 0) this.playBass808(now, 55.00); // A1
        if (s === 8) this.playBass808(now, 49.00); // G1
        // Smooth chords
        if (s === 0) this.playMelody(now, 523.25, 'sine'); // C5
        if (s === 4) this.playMelody(now, 587.33, 'sine'); // D5
        if (s === 8) this.playMelody(now, 659.25, 'sine'); // E5
      } else {
        // Boom Bap / Classic Hip Hop
        if (s === 0 || s === 7 || s === 10) this.playKick(now);
        if (s === 4 || s === 12) this.playSnare(now);
        if (s % 2 === 0) this.playHiHat(now);
        if (s === 0) this.playBass808(now, 50);
        if (s === 0 || s === 8) this.playMelody(now, 330, 'square');
      }

      this.currentStep = (this.currentStep + 1) % 16;
    };

    // Run initial tick immediately
    stepTick();
    this.currentBeatInterval = window.setInterval(stepTick, intervalMs);
  }

  public stopBeat() {
    this.isPlayingBeat = false;
    this.activeBeatId = null;
    if (this.currentBeatInterval !== null) {
      clearInterval(this.currentBeatInterval);
      this.currentBeatInterval = null;
    }
  }

  public isBeatActive(): boolean {
    return this.isPlayingBeat;
  }

  public getActiveBeatId(): string | null {
    return this.activeBeatId;
  }

  // Live Microphone Recording
  public async startRecording(): Promise<boolean> {
    try {
      this.recordedChunks = [];
      this.recordedAudioUrl = null;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micStream = stream;
      const ctx = this.getContext();
      const micSource = ctx.createMediaStreamSource(stream);
      micSource.connect(this.getAnalyser());

      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms chunks
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      return false;
    }
  }

  public stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedAudioUrl = URL.createObjectURL(blob);

        if (this.micStream) {
          this.micStream.getTracks().forEach((track) => track.stop());
          this.micStream = null;
        }

        resolve(this.recordedAudioUrl);
      };

      this.mediaRecorder.stop();
    });
  }

  public getRecordedAudioUrl(): string | null {
    return this.recordedAudioUrl;
  }
}

export const audioEngine = new AudioEngine();

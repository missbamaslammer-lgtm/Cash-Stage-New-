import React, { useState } from 'react';
import { 
  Radio, 
  Calendar, 
  Clock, 
  DollarSign, 
  Disc, 
  CheckCircle2, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Headphones,
  Users
} from 'lucide-react';
import { DjRadioSlot, UserProfile } from '../types';
import { audioEngine } from '../services/audioService';

interface LiveRadioFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: DjRadioSlot[];
  onBookSlot: (slotId: string, details: { djName: string; setTitle: string; genre: string }) => void;
  user: UserProfile;
}

export const LiveRadioFeedModal: React.FC<LiveRadioFeedModalProps> = ({
  isOpen,
  onClose,
  slots,
  onBookSlot,
  user,
}) => {
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DjRadioSlot | null>(null);
  const [djName, setDjName] = useState(user.name);
  const [setTitle, setSetTitle] = useState('Saturday Night 808 Mix');
  const [genre, setGenre] = useState('Dirty South Trap');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleRadio = () => {
    if (isPlayingRadio) {
      audioEngine.stopBeat();
      setIsPlayingRadio(false);
    } else {
      audioEngine.startBeat('slab_trap_heat', 138);
      setIsPlayingRadio(true);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    if (user.cashBalance < 10.00 && user.stageCoins < 1000) {
      alert('You need $10.00 Cash Stage Bucks or 1,000 Stage Coins to reserve a 30-min DJ set!');
      return;
    }

    audioEngine.playCashSound();
    onBookSlot(selectedSlot.id, { djName, setTitle, genre });
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedSlot(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Live Stage Radio 24/7</h2>
              <p className="text-xs text-zinc-400">
                Saturday & Sunday DJ RSVP slots • $10 for 30 minutes of live broadcasting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live On-Air Player */}
        <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900 to-indigo-950/30 p-4 rounded-2xl border border-blue-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Disc className={`w-6 h-6 ${isPlayingRadio ? 'animate-spin' : ''}`} />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider">
                  LIVE ON AIR
                </span>
                <span className="text-xs text-zinc-400 font-mono">1.4K Listeners Tuned In</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-0.5">
                DJ Trap King • Car Subwoofer Soundcheck Set
              </h3>
            </div>
          </div>

          <button
            onClick={handleToggleRadio}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              isPlayingRadio
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-blue-500 hover:bg-blue-400 text-zinc-950'
            }`}
          >
            {isPlayingRadio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingRadio ? 'Mute Stream' : 'Listen Live'}</span>
          </button>
        </div>

        {/* Saturday & Sunday DJ RSVP Booking Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm text-white">Weekend DJ Set RSVPs ($10 / 30 Min)</h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Saturday & Sunday Broadcast</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3.5 rounded-2xl border transition ${
                  slot.isBooked
                    ? 'bg-zinc-900/40 border-zinc-800/60'
                    : 'bg-zinc-900/90 border-zinc-700 hover:border-amber-400 cursor-pointer'
                }`}
                onClick={() => !slot.isBooked && setSelectedSlot(slot)}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-amber-400">{slot.day}</span>
                  <span className="font-mono text-zinc-400">{slot.timeSlot}</span>
                </div>

                {slot.isBooked ? (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-zinc-200 line-clamp-1">
                      {slot.setTitle || 'Reserved DJ Set'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>DJ: {slot.djName}</span>
                      <span className="text-emerald-400 font-bold">✓ RESERVED</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-emerald-400">$10.00 / 30 Min</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
                      RSVP Slot
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form Sheet */}
        {selectedSlot && (
          <div className="bg-zinc-900/90 p-4 rounded-2xl border border-amber-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Booking {selectedSlot.day} • {selectedSlot.timeSlot}</span>
              <span>Cost: $10.00 Bucks or 1,000 Coins</span>
            </div>

            {bookingSuccess ? (
              <div className="p-3 text-center text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>DJ Spot Confirmed! You are scheduled on the Live Radio feed.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">DJ Stage Name</label>
                    <input
                      type="text"
                      value={djName}
                      onChange={(e) => setDjName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Set Title</label>
                    <input
                      type="text"
                      value={setTitle}
                      onChange={(e) => setSetTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmBooking}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    Pay $10 & Confirm 30-Min Set
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

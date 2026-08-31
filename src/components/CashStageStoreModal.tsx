import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Coins, 
  DollarSign, 
  Music2, 
  Swords, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Zap, 
  Flame, 
  CreditCard 
} from 'lucide-react';
import { StoreItem, UserProfile } from '../types';
import { INITIAL_STORE_ITEMS } from '../data/initialData';
import { audioEngine } from '../services/audioService';

interface CashStageStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPurchaseItem: (item: StoreItem, paymentMethod: 'bucks' | 'coins') => void;
  onBuyCoins: (amount: number, price: number) => void;
}

export const CashStageStoreModal: React.FC<CashStageStoreModalProps> = ({
  isOpen,
  onClose,
  user,
  onPurchaseItem,
  onBuyCoins,
}) => {
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (item: StoreItem, method: 'bucks' | 'coins') => {
    if (method === 'bucks' && user.cashBalance < item.priceUsd) {
      alert(`Insufficient Cash Stage Bucks! You have $${user.cashBalance.toFixed(2)}.`);
      return;
    }
    if (method === 'coins' && user.stageCoins < item.priceCoins) {
      alert(`Insufficient Stage Coins! You have ${user.stageCoins.toLocaleString()} Coins.`);
      return;
    }

    if (item.type === 'coin_bundle') {
      audioEngine.playCoinSound();
      onBuyCoins(item.priceCoins, item.priceUsd);
    } else {
      audioEngine.playCashSound();
      onPurchaseItem(item, method);
    }

    setPurchaseSuccess(item.title);
    setTimeout(() => {
      setPurchaseSuccess(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Cash Stage Official Store</h2>
              <p className="text-xs text-zinc-400">
                Unlock extra drop slots, live feed spotlight pins, arena battles & weekend DJ sets
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

        {/* User Balance Wallet Bar */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cash Stage Bucks</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ${user.cashBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cash Stage Coins</span>
              <span className="text-base font-black text-amber-300 font-mono">
                {user.stageCoins.toLocaleString()} 🪙
              </span>
            </div>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Successfully purchased: {purchaseSuccess}!</span>
          </div>
        )}

        {/* Store Catalog Items */}
        <div className="space-y-3">
          {INITIAL_STORE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  {item.type === 'extra_solo_drop' && <Music2 className="w-4 h-4 text-amber-400" />}
                  {item.type === 'extra_battle_drop' && <Swords className="w-4 h-4 text-rose-400" />}
                  {item.type === 'live_feed_spotlight' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                  {item.type === 'dj_radio_rsvp' && <Radio className="w-4 h-4 text-blue-400" />}
                  {item.type === 'coin_bundle' && <Coins className="w-4 h-4 text-amber-400" />}

                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  {item.tag && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>

              {/* Purchase Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {item.type !== 'coin_bundle' ? (
                  <>
                    <button
                      onClick={() => handleBuy(item, 'bucks')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1 hover:scale-105 active:scale-95"
                    >
                      <span>${item.priceUsd.toFixed(2)}</span>
                    </button>

                    <button
                      onClick={() => handleBuy(item, 'coins')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1 hover:scale-105 active:scale-95"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.priceCoins} Coins</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleBuy(item, 'bucks')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Buy for ${item.priceUsd.toFixed(2)}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

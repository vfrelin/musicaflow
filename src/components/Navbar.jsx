import React from 'react';
import { Settings, Sparkles, Radio } from 'lucide-react';

export default function Navbar({ onOpenSettings }) {
  return (
    <header className="sticky top-0 z-30 bg-[#030303]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF0033] to-[#990011] flex items-center justify-center shadow-lg shadow-red-900/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Musica<span className="text-[#FF0033]">Flow</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-neutral-400 font-medium tracking-wide uppercase ml-1.5 bg-white/10 px-1.5 py-0.5 rounded">
              Free Stream
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Ajustes y Respaldos"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

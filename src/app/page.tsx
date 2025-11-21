'use client';

import { useState } from 'react';
import GameLayout from '@/components/game/GameLayout';
import TerminalGame from '@/components/game/TerminalGame';
import { Terminal, Monitor } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'modern' | 'cli'>('cli');

  return (
    <>
      {/* Mode Switcher */}
      {/* <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setMode(mode === 'modern' ? 'cli' : 'modern')}
          className="bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors shadow-lg border border-white/20"
          title={mode === 'modern' ? "Switch to CLI Mode" : "Switch to Modern Mode"}
        >
          {mode === 'modern' ? <Terminal className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </button>
      </div> */}

      {mode === 'modern' ? <GameLayout /> : <TerminalGame />}
    </>
  );
}

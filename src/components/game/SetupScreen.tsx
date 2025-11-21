'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game/store';
import { Users, Play } from 'lucide-react';

export default function SetupScreen() {
    const startGame = useGameStore((state) => state.startGame);
    const [numPlayers, setNumPlayers] = useState(1);
    const [names, setNames] = useState<string[]>(['Player 1']);

    const handleNumPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const n = Math.min(30, Math.max(1, parseInt(e.target.value) || 1));
        setNumPlayers(n);

        // Adjust names array
        const newNames = [...names];
        if (n > names.length) {
            for (let i = names.length; i < n; i++) {
                newNames.push(`Player ${i + 1}`);
            }
        } else {
            newNames.length = n;
        }
        setNames(newNames);
    };

    const handleNameChange = (index: number, value: string) => {
        const newNames = [...names];
        newNames[index] = value;
        setNames(newNames);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-4 border-yellow-400">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-yellow-600 mb-2">Lemonade Stand</h1>
                    <p className="text-gray-600">Manage your stand, watch the weather, and make millions!</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Number of Players (1-30)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={numPlayers}
                            onChange={handleNumPlayersChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {names.map((name, idx) => (
                            <div key={idx}>
                                <label className="block text-xs text-gray-500 mb-1">Player {idx + 1} Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleNameChange(idx, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => startGame(names)}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg transform active:scale-95"
                    >
                        <Play className="w-5 h-5" />
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
}

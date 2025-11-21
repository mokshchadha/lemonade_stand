import { PlayerState } from '@/lib/game/types';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
    players: PlayerState[];
    currentPlayerId?: string;
}

export default function Leaderboard({ players, currentPlayerId }: LeaderboardProps) {
    const sortedPlayers = [...players].sort((a, b) => b.cash - a.cash);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold text-gray-700">Standings</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`px-4 py-3 flex justify-between items-center ${player.id === currentPlayerId ? 'bg-yellow-50' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`
                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}
              `}>
                                {index + 1}
                            </span>
                            <span className={`text-sm ${player.id === currentPlayerId ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                {player.name}
                            </span>
                        </div>
                        <span className="font-mono text-sm font-medium text-green-600">
                            ${player.cash.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

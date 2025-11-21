'use client';

import { useGameStore } from '@/lib/game/store';
import SetupScreen from './SetupScreen';
import WeatherWidget from './WeatherWidget';
import ActionPanel from './ActionPanel';
import DailyReport from './DailyReport';
import Leaderboard from './Leaderboard';
import { RefreshCw } from 'lucide-react';

export default function GameLayout() {
    const {
        gameStatus,
        day,
        maxDays,
        players,
        currentPlayerIndex,
        currentWeather,
        submitTurn,
        nextDay,
        resetGame
    } = useGameStore();

    if (gameStatus === 'SETUP') {
        return <SetupScreen />;
    }

    if (gameStatus === 'FINISHED') {
        const sortedPlayers = [...players].sort((a, b) => b.cash - a.cash);
        const winner = sortedPlayers[0];

        return (
            <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                    <h1 className="text-4xl font-bold text-yellow-600 mb-4">Game Over!</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        The winner is <span className="font-bold text-gray-900">{winner.name}</span> with <span className="text-green-600 font-bold">${winner.cash.toFixed(2)}</span>!
                    </p>

                    <div className="mb-8">
                        <Leaderboard players={players} />
                    </div>

                    <button
                        onClick={resetGame}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const currentPlayer = players[currentPlayerIndex];
    const currentResult = currentPlayer.history.find(h => h.day === day);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-lg">
                        Day {day} / {maxDays}
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Lemonade Stand</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Player {currentPlayerIndex + 1} of {players.length}
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-6">
                    <WeatherWidget weather={currentWeather} />
                    <Leaderboard players={players} currentPlayerId={currentPlayer.id} />
                </div>

                {/* Center/Right: Game Area */}
                <div className="lg:col-span-2 flex items-center justify-center">
                    {currentResult ? (
                        <DailyReport
                            result={currentResult}
                            playerName={currentPlayer.name}
                            onNext={nextDay}
                        />
                    ) : (
                        <div className="w-full max-w-xl">
                            <ActionPanel
                                player={currentPlayer}
                                onSubmit={submitTurn}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

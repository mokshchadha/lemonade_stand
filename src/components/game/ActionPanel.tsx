'use client';

import { useState, useEffect } from 'react';
import { CONSTANTS, DailyInput, PlayerState } from '@/lib/game/types';
import { DollarSign, Megaphone, GlassWater } from 'lucide-react';

interface ActionPanelProps {
    player: PlayerState;
    onSubmit: (input: DailyInput) => void;
}

export default function ActionPanel({ player, onSubmit }: ActionPanelProps) {
    const [glasses, setGlasses] = useState(0);
    const [signs, setSigns] = useState(0);
    const [price, setPrice] = useState(25); // Default 25 cents

    const productionCost = glasses * CONSTANTS.COST_PER_GLASS;
    const signsCost = signs * CONSTANTS.COST_PER_SIGN;
    const totalCost = productionCost + signsCost;
    const canAfford = totalCost <= player.cash;

    // Reset inputs when player changes
    useEffect(() => {
        setGlasses(0);
        setSigns(0);
        setPrice(25);
    }, [player.id]);

    const handleSubmit = () => {
        if (canAfford) {
            onSubmit({
                glassesToMake: glasses,
                advertisingSigns: signs,
                pricePerGlass: price,
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{player.name}'s Turn</h2>
                <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 font-bold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {player.cash.toFixed(2)}
                </div>
            </div>

            <div className="space-y-8">
                {/* Production */}
                <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2"><GlassWater className="w-4 h-4 text-blue-500" /> Glasses to Make</span>
                        <span className="text-gray-500">Cost: ${(CONSTANTS.COST_PER_GLASS * glasses).toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1000" // Reasonable max?
                        value={glasses}
                        onChange={(e) => setGlasses(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            min="0"
                            value={glasses}
                            onChange={(e) => setGlasses(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-2 py-1 border rounded text-center"
                        />
                        <span className="text-xs text-gray-400">({CONSTANTS.COST_PER_GLASS}/glass)</span>
                    </div>
                </div>

                {/* Advertising */}
                <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-red-500" /> Advertising Signs</span>
                        <span className="text-gray-500">Cost: ${(CONSTANTS.COST_PER_SIGN * signs).toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={signs}
                        onChange={(e) => setSigns(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-400"
                    />
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            min="0"
                            value={signs}
                            onChange={(e) => setSigns(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-2 py-1 border rounded text-center"
                        />
                        <span className="text-xs text-gray-400">({CONSTANTS.COST_PER_SIGN}/sign)</span>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> Price per Glass (cents)</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                    <div className="flex justify-center">
                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 px-2 py-1 border rounded text-center font-bold text-green-700"
                        />
                    </div>
                </div>

                {/* Total & Submit */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total Investment:</span>
                        <span className={`text-xl font-bold ${canAfford ? 'text-gray-800' : 'text-red-500'}`}>
                            ${totalCost.toFixed(2)}
                        </span>
                    </div>

                    {!canAfford && (
                        <p className="text-red-500 text-sm text-center mb-2">Not enough cash!</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!canAfford}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${canAfford
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Open for Business!
                    </button>
                </div>
            </div>
        </div>
    );
}

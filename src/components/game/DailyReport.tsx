import { DailyResult } from '@/lib/game/types';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

interface DailyReportProps {
    result: DailyResult;
    playerName: string;
    onNext: () => void;
}

export default function DailyReport({ result, playerName, onNext }: DailyReportProps) {
    const isProfit = result.netProfit >= 0;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-yellow-400 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">{playerName}'s Report</h2>
            <p className="text-center text-gray-500 mb-6">Day {result.day}</p>

            {result.events.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-red-700 mb-2">News Flash!</h3>
                    <ul className="list-disc list-inside text-red-600">
                        {result.events.map((event, i) => (
                            <li key={i}>{event}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Glasses Sold</span>
                    <span className="font-bold text-xl">{result.glassesSold} / {result.input.glassesToMake}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Income</span>
                    <span className="font-mono text-green-600">+${result.income.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expenses</span>
                    <span className="font-mono text-red-500">-${result.expenses.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Net Profit</span>
                    <div className={`flex items-center gap-2 font-bold text-2xl ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        ${result.netProfit.toFixed(2)}
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                Next
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}

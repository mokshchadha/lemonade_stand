'use client';

import { useState, useEffect, useRef } from 'react';
import { LegacyLemonadeStand, IOHandler } from '@/lib/game/LegacyGame';
import { Terminal } from 'lucide-react';

export default function TerminalGame() {
    const [lines, setLines] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const resolveInputRef = useRef<((value: string) => void) | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<LegacyLemonadeStand | null>(null);
    const initializedRef = useRef(false);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // Initialize game
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const io: IOHandler = {
            print: (text: string) => {
                setLines((prev) => [...prev, text]);
            },
            ask: (question: string) => {
                setLines((prev) => [...prev, question]);
                setIsWaiting(true);
                return new Promise<string>((resolve) => {
                    resolveInputRef.current = resolve;
                });
            },
            clear: () => {
                setLines([]);
            }
        };

        const game = new LegacyLemonadeStand(io);
        gameRef.current = game;

        // Start game sequence
        (async () => {
            io.print("WELCOME TO LEMONADE STAND");
            io.print("TYPE 'START' TO BEGIN OR 'HELP' FOR INSTRUCTIONS");
            const cmd = await io.ask("COMMAND:");
            if (cmd.toLowerCase() === 'start') {
                const numPlayers = await io.ask("HOW MANY PLAYERS? (1-30)");
                await game.startGame(parseInt(numPlayers) || 1, true);
            } else {
                io.print("INSTRUCTIONS: BUY SUPPLIES, SELL LEMONADE, MAKE MONEY.");
                io.print("RELOAD TO START OVER.");
            }
        })();

    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isWaiting || !resolveInputRef.current) return;

        const value = inputValue;
        setInputValue('');
        setIsWaiting(false);

        // Echo input
        setLines((prev) => [...prev, `> ${value}`]);

        resolveInputRef.current(value);
        resolveInputRef.current = null;
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap space-y-1">
                {lines.map((line, i) => (
                    <div key={i} className="break-words">{line}</div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-green-900 pt-2">
                <span className="text-green-500 animate-pulse">{'>'}</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={!isWaiting}
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-900"
                    placeholder={isWaiting ? "Type your answer..." : "Please wait..."}
                />
            </form>
        </div>
    );
}

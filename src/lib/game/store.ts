import { create } from 'zustand';
import { CONSTANTS, GameState, PlayerState, DailyInput, Weather } from './types';
import { generateWeather, calculateDailySales } from './engine';

interface GameStore extends GameState {
  // Actions
  startGame: (playerNames: string[]) => void;
  submitTurn: (input: DailyInput) => void;
  nextDay: () => void;
  resetGame: () => void;
}

const INITIAL_STATE: Omit<GameStore, 'startGame' | 'submitTurn' | 'nextDay' | 'resetGame'> = {
  day: 1,
  maxDays: CONSTANTS.MAX_DAYS,
  players: [],
  currentPlayerIndex: 0,
  currentWeather: { type: 'Sunny', temperature: 80, isStormy: false }, // Will be randomized on start
  gameStatus: 'SETUP',
  isDayOver: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  startGame: (playerNames) => {
    const players: PlayerState[] = playerNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      cash: CONSTANTS.STARTING_CASH,
      inventory: { lemons: 0 },
      history: [],
    }));

    set({
      ...INITIAL_STATE,
      players,
      gameStatus: 'PLAYING',
      currentWeather: generateWeather(),
    });
  },

  submitTurn: (input) => {
    const { players, currentPlayerIndex, currentWeather, day } = get();
    const player = players[currentPlayerIndex];

    // Calculate result for this player immediately
    // Note: In some versions, all players submit, then results are shown. 
    // But to keep it simple and interactive, we can calculate immediately but maybe store it 
    // and only apply it when everyone is done? 
    // The prompt says "The program then gives a report of the earnings for that day."
    // If multiplayer, "each player is independent".
    // So we can process immediately and show a report for that player, then move to next player.
    
    const result = calculateDailySales(input, currentWeather);
    result.day = day;

    const updatedPlayer = {
      ...player,
      cash: player.cash + result.netProfit,
      history: [...player.history, result],
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
    });

    // If this was the last player, day is over?
    // Or do we show the report for THIS player first?
    // Let's assume we show report for THIS player, then they click "Next".
    // So we need a state "SHOWING_REPORT".
    // But `isDayOver` was my flag. Let's refine.
    // Actually, let's handle the UI flow in the component. 
    // The store just updates the state.
    // We need to know if we are waiting for the current player to acknowledge the result.
    
    // Let's add a `lastResult` to the store or just rely on `player.history`?
    // Relying on history is fine.
  },

  nextDay: () => {
    const { players, currentPlayerIndex, day, maxDays } = get();

    // If there are more players to play this day
    if (currentPlayerIndex < players.length - 1) {
      set({ currentPlayerIndex: currentPlayerIndex + 1 });
    } else {
      // All players done for the day
      if (day >= maxDays) {
        set({ gameStatus: 'FINISHED' });
      } else {
        set({
          day: day + 1,
          currentPlayerIndex: 0,
          currentWeather: generateWeather(),
        });
      }
    }
  },

  resetGame: () => {
    set({ ...INITIAL_STATE });
  },
}));

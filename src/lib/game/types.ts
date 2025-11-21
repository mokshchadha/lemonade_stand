export type WeatherType = 'Sunny' | 'Cloudy' | 'HotAndDry';

export interface Weather {
  type: WeatherType;
  temperature: number; // Just for flavor text potentially
  isStormy: boolean; // Special event on cloudy days
}

export interface PlayerState {
  id: string;
  name: string;
  cash: number;
  inventory: {
    lemons: number; // Not strictly needed if we just buy "glasses" worth of stock, but let's stick to the prompt "number of glasses to make"
    // The prompt says "number of glasses to make", implying we make them fresh each day.
    // Usually in this game you buy stock (cups, lemons, sugar, ice).
    // But the prompt specifically says: "prompted for three values: the number of glasses of lemonade to make, the number of advertising signs, and the cost of lemonade per glass."
    // This simplifies it: Cost is per glass made.
  };
  history: DailyResult[];
}

export interface DailyInput {
  glassesToMake: number;
  advertisingSigns: number;
  pricePerGlass: number;
}

export interface DailyResult {
  day: number;
  weather: Weather;
  input: DailyInput;
  glassesSold: number;
  income: number;
  expenses: number;
  netProfit: number;
  events: string[]; // "Thunderstorm!", "Street closed!"
}

export interface GameState {
  day: number;
  maxDays: number;
  players: PlayerState[];
  currentPlayerIndex: number; // For turn-based input
  currentWeather: Weather;
  gameStatus: 'SETUP' | 'PLAYING' | 'FINISHED';
  isDayOver: boolean; // To show results before next day
}

export const CONSTANTS = {
  COST_PER_GLASS: 0.02, // Cost to make one glass
  COST_PER_SIGN: 0.15, // Cost per ad sign
  STARTING_CASH: 2.00, // Classic starting amount
  MAX_DAYS: 12,
};

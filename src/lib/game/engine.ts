import { CONSTANTS, DailyInput, DailyResult, Weather, WeatherType } from './types';

export const generateWeather = (): Weather => {
  const rand = Math.random();
  let type: WeatherType = 'Sunny';
  let isStormy = false;

  if (rand < 0.3) {
    type = 'Cloudy';
    // 25% chance of storm on cloudy days
    if (Math.random() < 0.25) {
      isStormy = true;
    }
  } else if (rand < 0.6) {
    type = 'Sunny';
  } else {
    type = 'HotAndDry';
  }

  // Temperature flavor
  let temperature = 70;
  if (type === 'Sunny') temperature = 80 + Math.floor(Math.random() * 10);
  if (type === 'HotAndDry') temperature = 90 + Math.floor(Math.random() * 15);
  if (type === 'Cloudy') temperature = 60 + Math.floor(Math.random() * 10);
  if (isStormy) temperature -= 10;

  return { type, temperature, isStormy };
};

export const calculateDailySales = (
  input: DailyInput,
  weather: Weather
): DailyResult => {
  const { glassesToMake, advertisingSigns, pricePerGlass } = input;
  const events: string[] = [];

  // Expenses
  const productionCost = glassesToMake * CONSTANTS.COST_PER_GLASS;
  const advertisingCost = advertisingSigns * CONSTANTS.COST_PER_SIGN;
  const totalExpenses = productionCost + advertisingCost;

  // Check for Storm
  if (weather.isStormy) {
    events.push('Thunderstorm! Nobody came to the stand.');
    return {
      day: 0, // Filled in by caller
      weather,
      input,
      glassesSold: 0,
      income: 0,
      expenses: totalExpenses,
      netProfit: -totalExpenses,
      events,
    };
  }

  // Base Interest based on weather
  let customerInterest = 30; // Base
  if (weather.type === 'Sunny') customerInterest = 60;
  if (weather.type === 'HotAndDry') customerInterest = 90;
  if (weather.type === 'Cloudy') customerInterest = 20;

  // Price Factor (Classic sweet spot is around 25 cents)
  // If price > 25, interest drops. If price < 25, interest rises.
  // Let's say max price willing to pay is 100 cents.
  if (pricePerGlass >= 100) {
    customerInterest = 0;
  } else {
    const priceFactor = (100 - pricePerGlass) / 75; // 25c -> 1.0, 10c -> 1.2, 50c -> 0.66
    customerInterest *= priceFactor * priceFactor; // Quadratic falloff
  }

  // Advertising Factor
  // Logarithmic growth to simulate diminishing returns
  // log(1) = 0, log(10) ~ 2.3
  // Signs help visibility.
  const adFactor = 1 + Math.log(advertisingSigns + 1) * 0.5;
  customerInterest *= adFactor;

  // Randomness
  const randomFactor = 0.8 + Math.random() * 0.4; // +/- 20%
  let potentialCustomers = Math.floor(customerInterest * randomFactor);

  // Cap sales by inventory
  let glassesSold = Math.min(potentialCustomers, glassesToMake);
  
  // Random Event: Street Crew (Rare)
  if (Math.random() < 0.05) {
    events.push('Street crews bought all your lemonade!');
    glassesSold = glassesToMake;
  }
  
  // Random Event: Wind (Rare)
  if (Math.random() < 0.1 && advertisingSigns > 0) {
    events.push('Wind blew away some of your signs!');
    // Doesn't affect today's sales (signs already worked), but adds flavor
  }

  const income = glassesSold * (pricePerGlass / 100); // Price is in cents usually, let's assume input is cents
  const netProfit = income - totalExpenses;

  return {
    day: 0, // Filled in by caller
    weather,
    input,
    glassesSold,
    income,
    expenses: totalExpenses,
    netProfit,
    events,
  };
};

export interface IOHandler {
  print: (text: string) => void;
  ask: (question: string) => Promise<string>;
  clear: () => void;
}

export class LegacyLemonadeStand {
  private io: IOHandler;
  
  // Game constants
  private optimalPrice = 10; // cents - best price point
  private signCost = 0.15; // cost per advertising sign
  private baseCustomers = 30; // base number of potential customers
  private initialAssets = 2.00; // starting money
  private signEffectiveness = 0.5; // how much signs help
  private signDampening = 1; // sign effectiveness dampening
  
  // Game state
  private day = 0;
  private numPlayers = 0;
  private players: any[] = [];
  private weatherCode = 2; // 2=sunny, 5=storm, 7=hot, 10=cloudy
  private weatherMultiplier = 1;
  private eventFlags = {
    rainWarning: false,
    streetCrew: false,
    thunderstorm: false,
    heatWave: false
  };

  constructor(io: IOHandler) {
    this.io = io;
  }

  // Initialize a new game
  async startGame(numPlayers: number, isNewGame: boolean) {
    this.numPlayers = numPlayers;
    this.players = [];
    
    for (let i = 0; i < numPlayers; i++) {
      this.players.push({
        id: i + 1,
        assets: this.initialAssets,
        isBankrupt: false,
        glassesToMake: 0,
        signs: 0,
        price: 0,
        glassesMultiplier: 1, // affected by weather events
        skipTurn: false
      });
    }
    
    if (isNewGame) {
      this.day = 0;
    }

    // Start the game loop
    await this.gameLoop();
  }

  async gameLoop() {
    while (await this.playDay()) {
      const answer = await this.io.ask("CONTINUE TO NEXT DAY? (YES/NO)");
      if (!answer.toLowerCase().startsWith('y')) {
        break;
      }
    }
    this.io.print("GAME OVER. THANKS FOR PLAYING!");
  }

  // Get cost of lemonade per glass based on day
  getLemonadeCost() {
    if (this.day < 3) return 0.02; // Mom gives free sugar
    if (this.day < 7) return 0.04; // Normal cost
    return 0.05; // Price increase after day 6
  }

  // Generate weather for the day
  generateWeather() {
    if (this.day < 3) {
      this.weatherCode = 2; // Always sunny first 2 days
      return;
    }
    
    const random = Math.random();
    if (random < 0.6) {
      this.weatherCode = 2; // Sunny
    } else if (random < 0.8) {
      this.weatherCode = 10; // Cloudy
    } else {
      this.weatherCode = 7; // Hot and dry
    }
  }

  // Display weather report
  displayWeather() {
    const weatherNames: Record<number, string> = {
      2: "SUNNY",
      5: "THUNDERSTORMS!",
      7: "HOT AND DRY",
      10: "CLOUDY"
    };
    return weatherNames[this.weatherCode] || "UNKNOWN";
  }

  // Check for random events
  checkRandomEvents() {
    // 25% chance of street crew on sunny days
    if (this.weatherCode === 2 && Math.random() < 0.25 && !this.eventFlags.streetCrew) {
      this.eventFlags.streetCrew = true;
      this.io.print("THE STREET DEPARTMENT IS WORKING TODAY.");
      this.io.print("THERE WILL BE NO TRAFFIC ON YOUR STREET.");
      
      if (Math.random() < 0.5) {
        // Street crew blocks all customers
        this.weatherMultiplier = 0.1;
      } else {
        // Street crew buys everything at lunch
        return 'STREET_CREW_BUYS';
      }
    }
    
    // Rain warning on cloudy days
    if (this.weatherCode === 10 && !this.eventFlags.rainWarning) {
      const rainChance = 30 + Math.floor(Math.random() * 5) * 10;
      this.io.print(`THERE IS A ${rainChance}% CHANCE OF LIGHT RAIN,`);
      this.io.print("AND THE WEATHER IS COOLER TODAY.");
      this.weatherMultiplier = 1 - rainChance / 100;
      this.eventFlags.rainWarning = true;
    }
    
    // 25% chance of thunderstorm on cloudy days
    if (this.weatherCode === 10 && Math.random() < 0.25) {
      return 'THUNDERSTORM';
    }
    
    // Heat wave on hot days
    if (this.weatherCode === 7 && !this.eventFlags.heatWave) {
      this.io.print("A HEAT WAVE IS PREDICTED FOR TODAY!");
      this.weatherMultiplier = 2; // Double demand!
      this.eventFlags.heatWave = true;
    }
    
    return null;
  }

  // Get player input for the day
  async getPlayerDecisions(player: any) {
    const cost = this.getLemonadeCost();
    
    this.io.print(`\nLEMONADE STAND ${player.id} - ASSETS: $${player.assets.toFixed(2)}`);
    
    if (player.isBankrupt) {
      this.io.print("YOU ARE BANKRUPT, NO DECISIONS FOR YOU TO MAKE.");
      player.skipTurn = true;
      return;
    }
    
    // Get number of glasses to make
    let glassesToMake = parseInt(await this.io.ask("HOW MANY GLASSES OF LEMONADE DO YOU WISH TO MAKE?"));
    while (isNaN(glassesToMake) || glassesToMake < 0 || glassesToMake > 1000 || glassesToMake * cost > player.assets) {
      if (glassesToMake * cost > player.assets) {
        this.io.print(`THINK AGAIN! YOU HAVE ONLY $${player.assets.toFixed(2)}`);
        this.io.print(`TO MAKE ${glassesToMake} GLASSES YOU NEED $${(glassesToMake * cost).toFixed(2)}`);
      } else {
        this.io.print("COME ON, LET'S BE REASONABLE NOW!!!");
      }
      glassesToMake = parseInt(await this.io.ask("TRY AGAIN:"));
    }
    
    // Get number of signs
    let signs = parseInt(await this.io.ask(`HOW MANY ADVERTISING SIGNS (${(this.signCost * 100).toFixed(0)} CENTS EACH)?`));
    while (isNaN(signs) || signs < 0 || signs > 50 || signs * this.signCost > player.assets - glassesToMake * cost) {
      if (signs * this.signCost > player.assets - glassesToMake * cost) {
        const remaining = player.assets - glassesToMake * cost;
        this.io.print(`THINK AGAIN! YOU HAVE ONLY $${remaining.toFixed(2)} LEFT AFTER MAKING LEMONADE`);
      } else {
        this.io.print("COME ON, BE REASONABLE!");
      }
      signs = parseInt(await this.io.ask("TRY AGAIN:"));
    }
    
    // Get price per glass
    let price = parseInt(await this.io.ask("WHAT PRICE (IN CENTS) DO YOU WISH TO CHARGE?"));
    while (isNaN(price) || price < 0 || price > 100) {
      this.io.print("COME ON, BE REASONABLE!");
      price = parseInt(await this.io.ask("TRY AGAIN:"));
    }
    
    player.glassesToMake = glassesToMake;
    player.signs = signs;
    player.price = price;
  }

  // Calculate demand based on price and advertising
  calculateDemand(price: number, signs: number) {
    let demand;
    
    // Price elasticity - demand decreases as price increases
    if (price >= this.optimalPrice) {
      demand = (this.optimalPrice ** 2 * this.baseCustomers) / (price ** 2);
    } else {
      const priceEffect = (this.optimalPrice - price) / this.optimalPrice * 0.8 * this.baseCustomers;
      demand = priceEffect + this.baseCustomers;
    }
    
    // Advertising effect - exponential decay function
    const adEffect = -signs * this.signEffectiveness;
    const adMultiplier = 1 - (Math.exp(adEffect) * this.signDampening);
    
    // Apply advertising boost
    demand = demand + (demand * adMultiplier);
    
    // Apply weather/event multiplier
    demand = demand * this.weatherMultiplier;
    
    return Math.floor(demand);
  }

  // Calculate results for the day
  calculateDayResults() {
    const cost = this.getLemonadeCost();
    const specialEvent = this.checkRandomEvents();
    
    if (specialEvent === 'THUNDERSTORM') {
      this.io.print("\nWEATHER REPORT: A SEVERE THUNDERSTORM");
      this.io.print("HIT LEMONSVILLE EARLIER TODAY, JUST AS");
      this.io.print("THE LEMONADE STANDS WERE BEING SET UP.");
      this.io.print("UNFORTUNATELY, EVERYTHING WAS RUINED!!");
      
      // All lemonade destroyed
      for (let player of this.players) {
        player.glassesMultiplier = 0;
      }
    }
    
    this.io.print("\n$$ LEMONSVILLE DAILY FINANCIAL REPORT $$\n");
    
    for (let player of this.players) {
      if (player.skipTurn) continue;
      
      // Calculate glasses sold
      let glassesSold = this.calculateDemand(player.price, player.signs);
      glassesSold = Math.floor(glassesSold * player.glassesMultiplier);
      
      // Can't sell more than you made
      if (glassesSold > player.glassesToMake) {
        glassesSold = player.glassesToMake;
      }
      
      // Special event: street crew buys all
      if (specialEvent === 'STREET_CREW_BUYS') {
        glassesSold = player.glassesToMake;
        this.io.print("THE STREET CREWS BOUGHT ALL YOUR LEMONADE AT LUNCHTIME!!");
      }
      
      // Calculate finances
      const income = glassesSold * (player.price / 100);
      const expenses = (player.signs * this.signCost) + (player.glassesToMake * cost);
      const profit = income - expenses;
      
      player.assets += profit;
      
      // Display results
      this.io.print(`\n=== DAY ${this.day} - STAND ${player.id} ===`);
      this.io.print(`${glassesSold} GLASSES SOLD`);
      this.io.print(`$${(player.price / 100).toFixed(2)} PER GLASS`);
      this.io.print(`INCOME: $${income.toFixed(2)}`);
      this.io.print(`\n${player.glassesToMake} GLASSES MADE`);
      this.io.print(`${player.signs} SIGNS MADE`);
      this.io.print(`EXPENSES: $${expenses.toFixed(2)}`);
      this.io.print(`\nPROFIT: $${profit.toFixed(2)}`);
      this.io.print(`ASSETS: $${player.assets.toFixed(2)}`);
      
      // Check for bankruptcy
      if (player.assets <= cost) {
        this.io.print("\n...YOU DON'T HAVE ENOUGH MONEY LEFT");
        this.io.print("TO STAY IN BUSINESS. YOU'RE BANKRUPT!");
        player.isBankrupt = true;
      }
    }
    
    // Reset for next day
    this.weatherMultiplier = 1;
  }

  // Play one day
  async playDay() {
    this.day++;
    
    // Generate weather
    this.generateWeather();
    this.io.print(`\n=== DAY ${this.day} ===`);
    this.io.print(`Weather: ${this.displayWeather()}`);
    this.io.print(`Cost of lemonade: $${this.getLemonadeCost().toFixed(2)} per glass`);
    
    // Special announcements
    if (this.day === 3) {
      this.io.print("(YOUR MOTHER QUIT GIVING YOU FREE SUGAR)");
    }
    if (this.day === 7) {
      this.io.print("(THE PRICE OF LEMONADE MIX JUST WENT UP)");
    }
    
    // Get decisions from each player
    for (let player of this.players) {
      player.glassesMultiplier = 1; // Reset
      player.skipTurn = false;
      await this.getPlayerDecisions(player);
    }
    
    // Calculate and display results
    this.calculateDayResults();
    
    // Check if all players are bankrupt
    const allBankrupt = this.players.every(p => p.isBankrupt);
    if (allBankrupt) {
      this.io.print("\nGAME OVER - ALL PLAYERS ARE BANKRUPT!");
      return false;
    }
    
    return true;
  }
}

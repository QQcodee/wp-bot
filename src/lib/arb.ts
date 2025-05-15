type Outcome = {
  name: "Over" | "Under";
  description: string;
  price: number;
  point: number;
};

type Market = {
  key: string;
  outcomes: Outcome[];
};

type Bookmaker = {
  key: string;
  title: string;
  markets: Market[];
};

type Event = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
};

type ArbitrageOpportunity = {
  player: string;
  market: string;
  over: {
    bookmaker: string;
    price: number;
    point: number;
  };
  under: {
    bookmaker: string;
    price: number;
    point: number;
  };
  impliedProbability: number;
};

export function findArbitrage(event: Event): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  type OutcomeExtended = Outcome & {
    bookmakerKey: string;
    bookmakerTitle: string;
    marketKey: string;
  };

  // Step 1: Flatten all outcomes across bookmakers
  const allOutcomes: OutcomeExtended[] = [];

  for (const bookmaker of event.bookmakers) {
    for (const market of bookmaker.markets) {
      for (const outcome of market.outcomes) {
        allOutcomes.push({
          ...outcome,
          bookmakerKey: bookmaker.key,
          bookmakerTitle: bookmaker.title,
          marketKey: market.key,
        });
      }
    }
  }

  // Step 2: Match Over and Under across different bookmakers
  for (let i = 0; i < allOutcomes.length; i++) {
    const o1 = allOutcomes[i];
    for (let j = i + 1; j < allOutcomes.length; j++) {
      const o2 = allOutcomes[j];

      // Must be same player, same market, same point
      if (
        o1.description === o2.description &&
        o1.marketKey === o2.marketKey &&
        o1.point === o2.point &&
        o1.bookmakerKey !== o2.bookmakerKey
      ) {
        // One must be Over and one must be Under
        if (
          (o1.name === "Over" && o2.name === "Under") ||
          (o1.name === "Under" && o2.name === "Over")
        ) {
          const over = o1.name === "Over" ? o1 : o2;
          const under = o1.name === "Under" ? o1 : o2;

          const impliedProbability = 1 / over.price + 1 / under.price;

          if (impliedProbability < 1.0) {
            opportunities.push({
              player: over.description,
              market: over.marketKey,
              over: {
                bookmaker: over.bookmakerTitle,
                price: over.price,
                point: over.point,
              },
              under: {
                bookmaker: under.bookmakerTitle,
                price: under.price,
                point: under.point,
              },
              impliedProbability,
            });
          }
        }
      }
    }
  }

  return opportunities;
}

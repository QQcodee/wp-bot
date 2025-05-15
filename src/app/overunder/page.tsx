"use client";
import { useEffect, useState } from "react";

interface Outcome {
  name: "Over" | "Under";
  price: number;
  point: number;
}

interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface MatchData {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

// Define the types here as shown above

const matchData: MatchData = {
  id: "8af134619ff871a0b76992d76de7e224",
  sport_key: "basketball_nba",
  sport_title: "NBA",
  commence_time: "2025-04-26T00:05:00Z",
  home_team: "Milwaukee Bucks",
  away_team: "Indiana Pacers",
  bookmakers: [
    {
      key: "draftkings",
      title: "DraftKings",
      markets: [
        {
          key: "totals_q2",
          last_update: "2025-04-25T22:11:05Z",
          outcomes: [
            {
              name: "Over",
              price: -105,
              point: 56.5,
            },
            {
              name: "Under",
              price: -125,
              point: 56.5,
            },
          ],
        },
      ],
    },
    {
      key: "fanduel",
      title: "FanDuel",
      markets: [
        {
          key: "totals_q2",
          last_update: "2025-04-25T22:11:43Z",
          outcomes: [
            {
              name: "Over",
              price: -104,
              point: 56.5,
            },
            {
              name: "Under",
              price: -122,
              point: 56.5,
            },
          ],
        },
      ],
    },
    {
      key: "bovada",
      title: "Bovada",
      markets: [
        {
          key: "totals_q2",
          last_update: "2025-04-25T22:10:37Z",
          outcomes: [
            {
              name: "Over",
              price: -115,
              point: 56.0,
            },
            {
              name: "Under",
              price: -105,
              point: 56.0,
            },
          ],
        },
      ],
    },
    {
      key: "betrivers",
      title: "BetRivers",
      markets: [
        {
          key: "totals_q2",
          last_update: "2025-04-25T22:11:30Z",
          outcomes: [
            {
              name: "Over",
              price: -110,
              point: 56.5,
            },
            {
              name: "Under",
              price: -121,
              point: 56.5,
            },
          ],
        },
      ],
    },
  ],
};
export default function PlayerPropsPage() {
  const [matchDetails, setMatchDetails] = useState<MatchData | null>(null);

  useEffect(() => {
    setMatchDetails(matchData);
  }, []);

  if (!matchDetails) return <div>Loading...</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{matchDetails.sport_title}</h1>
      <h2 className="text-xl font-semibold">
        {matchDetails.home_team} vs {matchDetails.away_team}
      </h2>
      <p>
        Commence Time: {new Date(matchDetails.commence_time).toLocaleString()}
      </p>

      {/* Render Bookmakers and Markets */}
      {matchDetails.bookmakers.map((bookmaker) => (
        <div key={bookmaker.key} className="mt-4 border p-4">
          <h3 className="text-lg font-medium">{bookmaker.title}</h3>
          {bookmaker.markets.map((market) => (
            <div key={market.key} className="mt-2">
              <h4 className="font-semibold">Market: {market.key}</h4>
              <p>
                Last Updated: {new Date(market.last_update).toLocaleString()}
              </p>

              {/* Render the outcomes (Over and Under bets) */}
              <div className="space-y-2">
                {market.outcomes.map((outcome, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{outcome.name}</span>
                    <span>
                      {outcome.point} Points -{" "}
                      {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}

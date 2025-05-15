"use client";
import React from "react";
import { findArbitrage } from "@/lib/arb";
import ArbitrageCalculator from "@/components/ArbCalc";

// Sample JSON data (replace with your actual data)
const eventData = {
  id: "5ed30106dccf7db288641b620e248242",
  sport_key: "basketball_nba",
  sport_title: "NBA",
  commence_time: "2025-04-26T17:06:16Z",
  home_team: "Miami Heat",
  away_team: "Cleveland Cavaliers",
  bookmakers: [
    {
      key: "draftkings",
      title: "DraftKings",
      markets: [
        {
          key: "player_assists",
          last_update: "2025-04-26T18:06:27Z",
          outcomes: [
            {
              name: "Over",
              description: "Ty Jerome",
              price: 1.77,
              point: 9.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 2.0,
              point: 9.5,
            },
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 2.15,
              point: 7.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 1.68,
              point: 7.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 2.4,
              point: 5.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.55,
              point: 5.5,
            },
            {
              name: "Over",
              description: "Evan Mobley",
              price: 1.68,
              point: 3.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 2.15,
              point: 3.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 2.26,
              point: 3.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 1.62,
              point: 3.5,
            },
          ],
        },
        {
          key: "player_points",
          last_update: "2025-04-26T18:06:27Z",
          outcomes: [
            {
              name: "Over",
              description: "Bam Adebayo",
              price: 1.77,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Bam Adebayo",
              price: 2.0,
              point: 22.5,
            },
            {
              name: "Over",
              description: "De'Andre Hunter",
              price: 1.8,
              point: 22.5,
            },
            {
              name: "Under",
              description: "De'Andre Hunter",
              price: 1.95,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Jarrett Allen",
              price: 1.77,
              point: 21.5,
            },
            {
              name: "Under",
              description: "Jarrett Allen",
              price: 2.0,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 1.77,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 2.0,
              point: 17.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 2.0,
              point: 16.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 1.77,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Evan Mobley",
              price: 2.0,
              point: 16.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.77,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 2.0,
              point: 13.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.77,
              point: 13.5,
            },
            {
              name: "Over",
              description: "Andrew Wiggins",
              price: 1.87,
              point: 11.5,
            },
            {
              name: "Under",
              description: "Andrew Wiggins",
              price: 1.87,
              point: 11.5,
            },
            {
              name: "Over",
              description: "Ty Jerome",
              price: 1.77,
              point: 10.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 2.0,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 2.0,
              point: 10.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 1.77,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Kel'el Ware",
              price: 2.0,
              point: 7.5,
            },
            {
              name: "Under",
              description: "Kel'el Ware",
              price: 1.77,
              point: 7.5,
            },
          ],
        },
        {
          key: "player_points_assists",
          last_update: "2025-04-26T18:06:27Z",
          outcomes: [
            {
              name: "Over",
              description: "Bam Adebayo",
              price: 1.87,
              point: 24.5,
            },
            {
              name: "Under",
              description: "Bam Adebayo",
              price: 1.87,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 1.77,
              point: 20.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 2.0,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 1.77,
              point: 19.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 2.0,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Evan Mobley",
              price: 1.8,
              point: 19.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.95,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 1.95,
              point: 18.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.8,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 1.95,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 1.8,
              point: 17.5,
            },
          ],
        },
        {
          key: "player_points_rebounds_assists",
          last_update: "2025-04-26T18:06:27Z",
          outcomes: [
            {
              name: "Over",
              description: "Evan Mobley",
              price: 1.8,
              point: 25.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.95,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Ty Jerome",
              price: 2.0,
              point: 24.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 1.77,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 1.83,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 1.91,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 1.83,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.91,
              point: 22.5,
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
          key: "player_assists",
          last_update: "2025-04-26T18:05:51Z",
          outcomes: [
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 2.18,
              point: 7.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 1.63,
              point: 7.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 2.54,
              point: 5.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.48,
              point: 5.5,
            },
            {
              name: "Over",
              description: "Ty Jerome",
              price: 2.16,
              point: 9.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 1.65,
              point: 9.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 2.3,
              point: 3.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 1.57,
              point: 3.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 2.16,
              point: 3.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 1.65,
              point: 3.5,
            },
            {
              name: "Over",
              description: "Evan Mobley",
              price: 1.94,
              point: 3.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.8,
              point: 3.5,
            },
            {
              name: "Over",
              description: "Bam Adebayo",
              price: 1.74,
              point: 1.5,
            },
            {
              name: "Under",
              description: "Bam Adebayo",
              price: 2.02,
              point: 1.5,
            },
          ],
        },
        {
          key: "player_points",
          last_update: "2025-04-26T17:59:16Z",
          outcomes: [
            {
              name: "Over",
              description: "Evan Mobley",
              price: 1.94,
              point: 14.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.8,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 1.85,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 1.89,
              point: 17.5,
            },
            {
              name: "Over",
              description: "De'Andre Hunter",
              price: 1.74,
              point: 19.5,
            },
            {
              name: "Under",
              description: "De'Andre Hunter",
              price: 2.02,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Andrew Wiggins",
              price: 1.76,
              point: 12.5,
            },
            {
              name: "Under",
              description: "Andrew Wiggins",
              price: 2.0,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 1.76,
              point: 8.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 2.0,
              point: 8.5,
            },
            {
              name: "Over",
              description: "Bam Adebayo",
              price: 1.78,
              point: 23.5,
            },
            {
              name: "Under",
              description: "Bam Adebayo",
              price: 1.96,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Jarrett Allen",
              price: 1.72,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Jarrett Allen",
              price: 2.04,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 2.0,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 1.76,
              point: 17.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 1.82,
              point: 13.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.94,
              point: 13.5,
            },
            {
              name: "Over",
              description: "Ty Jerome",
              price: 1.88,
              point: 10.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 1.88,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Kel'el Ware",
              price: 1.83,
              point: 7.5,
            },
            {
              name: "Under",
              description: "Kel'el Ware",
              price: 1.91,
              point: 7.5,
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
          key: "player_points",
          last_update: "2025-04-26T18:06:00Z",
          outcomes: [
            {
              name: "Over",
              description: "Kel'el Ware",
              price: 1.72,
              point: 7.5,
            },
            {
              name: "Under",
              description: "Kel'el Ware",
              price: 2.02,
              point: 7.5,
            },
            {
              name: "Over",
              description: "Evan Mobley",
              price: 2.02,
              point: 16.5,
            },
            {
              name: "Under",
              description: "Evan Mobley",
              price: 1.72,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Davion Mitchell",
              price: 1.88,
              point: 10.5,
            },
            {
              name: "Under",
              description: "Davion Mitchell",
              price: 1.83,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Ty Jerome",
              price: 1.88,
              point: 11.5,
            },
            {
              name: "Under",
              description: "Ty Jerome",
              price: 1.83,
              point: 11.5,
            },
            {
              name: "Over",
              description: "Bam Adebayo",
              price: 1.95,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Bam Adebayo",
              price: 1.77,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Max Strus",
              price: 1.88,
              point: 13.5,
            },
            {
              name: "Under",
              description: "Max Strus",
              price: 1.83,
              point: 13.5,
            },
            {
              name: "Over",
              description: "Tyler Herro",
              price: 1.93,
              point: 19.5,
            },
            {
              name: "Under",
              description: "Tyler Herro",
              price: 1.78,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Andrew Wiggins",
              price: 1.73,
              point: 12.5,
            },
            {
              name: "Under",
              description: "Andrew Wiggins",
              price: 2.0,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Jarrett Allen",
              price: 1.91,
              point: 21.5,
            },
            {
              name: "Under",
              description: "Jarrett Allen",
              price: 1.81,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Donovan Mitchell",
              price: 1.97,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Donovan Mitchell",
              price: 1.76,
              point: 17.5,
            },
            {
              name: "Over",
              description: "De'Andre Hunter",
              price: 1.78,
              point: 21.5,
            },
            {
              name: "Under",
              description: "De'Andre Hunter",
              price: 1.94,
              point: 21.5,
            },
          ],
        },
      ],
    },
  ],
};

const Page = () => {
  const [opportunities, setOpportunities] = React.useState([]);

  React.useEffect(() => {
    const opportunities = findArbitrage(eventData);
    setOpportunities(opportunities);

    if (opportunities.length === 0) {
      console.log("❌ No arbitrage opportunities found.");
      return;
    }

    console.log(`✅ Found ${opportunities.length} arbitrage opportunities:\n`);
    opportunities.forEach((opportunity, index) => {
      console.log(`--- Opportunity ${index + 1} ---`);
      console.log(`Player: ${opportunity.player}`);
      console.log(`Market: ${opportunity.market}`);
      console.log(
        `Over:  ${opportunity.over.bookmaker} @ ${opportunity.over.price} (point ${opportunity.over.point})`,
      );
      console.log(
        `Under: ${opportunity.under.bookmaker} @ ${opportunity.under.price} (point ${opportunity.under.point})`,
      );
      console.log(
        `Implied Probability: ${(opportunity.impliedProbability * 100).toFixed(2)}%`,
      );
      console.log("-------------------------\n");
    });
  }, []);

  return (
    <>
      {/* Render opportunities dynamically */}
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">
        Arbitrage Opportunities
      </h2>
      <div className="space-y-6">
        {opportunities.length === 0 ? (
          <p className="text-lg text-gray-700">
            No arbitrage opportunities found.
          </p>
        ) : (
          opportunities.map((opportunity, index) => (
            <div
              key={index}
              className="rounded-md border bg-gray-50 p-4 shadow-md"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                Opportunity {index + 1}: {opportunity.player} -{" "}
                {opportunity.market}
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-lg text-gray-700">
                  <span className="font-medium">Over:</span>{" "}
                  {opportunity.over.bookmaker} @ {opportunity.over.price} (point{" "}
                  {opportunity.over.point})
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-medium">Under:</span>{" "}
                  {opportunity.under.bookmaker} @ {opportunity.under.price}{" "}
                  (point {opportunity.under.point})
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-medium">Implied Probability:</span>{" "}
                  {(opportunity.impliedProbability * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Page;

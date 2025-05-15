require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios"); // Import axios for API requests

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- Helper to Convert American Odds to Implied Probability ---
function americanToProbability(odd) {
  if (odd > 0) {
    return 100 / (odd + 100);
  } else {
    return -odd / (-odd + 100);
  }
}

// --- Find Arbitrage Logic ---

function findArbitrage(event) {
  const opportunities = [];

  // Extend outcome
  const allOutcomes = [];

  for (const bookmaker of event.bookmakers || []) {
    for (const market of bookmaker.markets || []) {
      for (const outcome of market.outcomes || []) {
        allOutcomes.push({
          ...outcome,
          bookmakerKey: bookmaker.key,
          bookmakerTitle: bookmaker.title,
          marketKey: market.key,
        });
      }
    }
  }

  for (let i = 0; i < allOutcomes.length; i++) {
    const o1 = allOutcomes[i];
    for (let j = i + 1; j < allOutcomes.length; j++) {
      const o2 = allOutcomes[j];

      if (
        o1.description === o2.description &&
        o1.marketKey === o2.marketKey &&
        o1.point === o2.point &&
        o1.bookmakerKey !== o2.bookmakerKey
      ) {
        if (
          (o1.name === "Over" && o2.name === "Under") ||
          (o1.name === "Under" && o2.name === "Over")
        ) {
          const over = o1.name === "Over" ? o1 : o2;
          const under = o1.name === "Under" ? o1 : o2;

          const overProbability = americanToProbability(over.price);
          const underProbability = americanToProbability(under.price);
          const impliedProbability = overProbability + underProbability;
          const profitPercentage = (1 - impliedProbability) * 100;

          if (impliedProbability < 1.0 && profitPercentage >= 1) {
            // Keep only profit > 3%
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
              profitPercentage: parseFloat(profitPercentage.toFixed(2)),
            });
          }
        }
      }
    }
  }

  return opportunities;
}

// --- API Endpoint ---
app.post("/find-arbitrage", (req, res) => {
  console.log("Received event data:");
  try {
    const event = req.body;

    if (!event || !event.bookmakers) {
      return res.status(400).json({ error: "Invalid event data" });
    }

    const opportunities = findArbitrage(event);

    if (opportunities.length === 0) {
      return res.json({ message: "No arbitrage opportunities found" });
    }

    return res.json(opportunities);
  } catch (error) {
    console.error("Error finding arbitrage:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/get-events", async (req, res) => {
  try {
    // Call your external API
    const response = await axios.get(
      "https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&oddsFormat=american&apiKey=8dd67ec73352cfd0df5a925b7f67a766",
      req.body,
    ); // <-- using POST method

    const events = response.data;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid events format" });
    }

    // Extract only the IDs
    const eventIds = events.map((event) => event.id);

    return res.json({ ids: eventIds });
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



[
    {
    "ids": 
    [
    "b6d5576873db12b6da0e7f6062b3e71d",
    "64727ecb83898fd5fa4ba086945dd594",
    "97c436574586a603abfb5d3d649633a6",
    "700aede8724030d06159df96613b775d",
    "d3aa100c8b388c2759a377cbd2f4640f",
    "d1b9fe3922bd203db8c1d44358c1fb30",
    "32d285715ef87d49b04641e1d07538fd"
    ]
    }
    ]
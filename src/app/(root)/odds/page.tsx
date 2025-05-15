"use client";
import React from "react";

interface Outcome {
  name: string;
  price: number;
}

interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

const data: Game[] = [
  {
    id: "5a935d4f284b3fcf84515f522e9079f9",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-25T23:05:00Z",
    home_team: "Orlando Magic",
    away_team: "Boston Celtics",
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -175,
              },
              {
                name: "Orlando Magic",
                price: 145,
              },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -168,
              },
              {
                name: "Orlando Magic",
                price: 142,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -170,
              },
              {
                name: "Orlando Magic",
                price: 137,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -160,
              },
              {
                name: "Orlando Magic",
                price: 135,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -165,
              },
              {
                name: "Orlando Magic",
                price: 146,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -165,
              },
              {
                name: "Orlando Magic",
                price: 145,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -167,
              },
              {
                name: "Orlando Magic",
                price: 143,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -170,
              },
              {
                name: "Orlando Magic",
                price: 145,
              },
            ],
          },
        ],
      },
      {
        key: "betus",
        title: "BetUS",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Boston Celtics",
                price: -165,
              },
              {
                name: "Orlando Magic",
                price: 142,
              },
            ],
          },
        ],
      },
    ],
  },
  {
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
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 170,
              },
              {
                name: "Milwaukee Bucks",
                price: -205,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 189,
              },
              {
                name: "Milwaukee Bucks",
                price: -225,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 180,
              },
              {
                name: "Milwaukee Bucks",
                price: -220,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 191,
              },
              {
                name: "Milwaukee Bucks",
                price: -223,
              },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 188,
              },
              {
                name: "Milwaukee Bucks",
                price: -225,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 180,
              },
              {
                name: "Milwaukee Bucks",
                price: -220,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 185,
              },
              {
                name: "Milwaukee Bucks",
                price: -233,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 185,
              },
              {
                name: "Milwaukee Bucks",
                price: -225,
              },
            ],
          },
        ],
      },
      {
        key: "betus",
        title: "BetUS",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Indiana Pacers",
                price: 180,
              },
              {
                name: "Milwaukee Bucks",
                price: -210,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cce8a5bd08230e0c507ec925508889bc",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-26T01:30:00Z",
    home_team: "Minnesota Timberwolves",
    away_team: "Los Angeles Lakers",
    bookmakers: [
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 130,
              },
              {
                name: "Minnesota Timberwolves",
                price: -154,
              },
            ],
          },
        ],
      },
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 124,
              },
              {
                name: "Minnesota Timberwolves",
                price: -148,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 141,
              },
              {
                name: "Minnesota Timberwolves",
                price: -160,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 130,
              },
              {
                name: "Minnesota Timberwolves",
                price: -155,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 140,
              },
              {
                name: "Minnesota Timberwolves",
                price: -160,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 135,
              },
              {
                name: "Minnesota Timberwolves",
                price: -165,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 135,
              },
              {
                name: "Minnesota Timberwolves",
                price: -167,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 135,
              },
              {
                name: "Minnesota Timberwolves",
                price: -160,
              },
            ],
          },
        ],
      },
      {
        key: "betus",
        title: "BetUS",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Los Angeles Lakers",
                price: 138,
              },
              {
                name: "Minnesota Timberwolves",
                price: -160,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "5ed30106dccf7db288641b620e248242",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-26T17:05:00Z",
    home_team: "Miami Heat",
    away_team: "Cleveland Cavaliers",
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -205,
              },
              {
                name: "Miami Heat",
                price: 170,
              },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -220,
              },
              {
                name: "Miami Heat",
                price: 184,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:33:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:33:55Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -238,
              },
              {
                name: "Miami Heat",
                price: 189,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -209,
              },
              {
                name: "Miami Heat",
                price: 182,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -210,
              },
              {
                name: "Miami Heat",
                price: 180,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -220,
              },
              {
                name: "Miami Heat",
                price: 180,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -230,
              },
              {
                name: "Miami Heat",
                price: 190,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -210,
              },
              {
                name: "Miami Heat",
                price: 175,
              },
            ],
          },
        ],
      },
      {
        key: "betus",
        title: "BetUS",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Cleveland Cavaliers",
                price: -210,
              },
              {
                name: "Miami Heat",
                price: 180,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1f70941e477df98e94d9c55421d7b71",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-26T19:35:00Z",
    home_team: "Memphis Grizzlies",
    away_team: "Oklahoma City Thunder",
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 625,
              },
              {
                name: "Oklahoma City Thunder",
                price: -950,
              },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 700,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1100,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 775,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1400,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 733,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1077,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 709,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1100,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 700,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1115,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 750,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1400,
              },
            ],
          },
        ],
      },
      {
        key: "betus",
        title: "BetUS",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Memphis Grizzlies",
                price: 700,
              },
              {
                name: "Oklahoma City Thunder",
                price: -1100,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "b6d5576873db12b6da0e7f6062b3e71d",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-26T22:05:00Z",
    home_team: "Los Angeles Clippers",
    away_team: "Denver Nuggets",
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 200,
              },
              {
                name: "Los Angeles Clippers",
                price: -245,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 200,
              },
              {
                name: "Los Angeles Clippers",
                price: -250,
              },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 190,
              },
              {
                name: "Los Angeles Clippers",
                price: -230,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 203,
              },
              {
                name: "Los Angeles Clippers",
                price: -245,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 206,
              },
              {
                name: "Los Angeles Clippers",
                price: -243,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 185,
              },
              {
                name: "Los Angeles Clippers",
                price: -225,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 189,
              },
              {
                name: "Los Angeles Clippers",
                price: -238,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Denver Nuggets",
                price: 200,
              },
              {
                name: "Los Angeles Clippers",
                price: -240,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "64727ecb83898fd5fa4ba086945dd594",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-27T00:30:00Z",
    home_team: "Golden State Warriors",
    away_team: "Houston Rockets",
    bookmakers: [
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -152,
              },
              {
                name: "Houston Rockets",
                price: 128,
              },
            ],
          },
        ],
      },
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -148,
              },
              {
                name: "Houston Rockets",
                price: 124,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -160,
              },
              {
                name: "Houston Rockets",
                price: 135,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -154,
              },
              {
                name: "Houston Rockets",
                price: 125,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -159,
              },
              {
                name: "Houston Rockets",
                price: 140,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -159,
              },
              {
                name: "Houston Rockets",
                price: 139,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -148,
              },
              {
                name: "Houston Rockets",
                price: 123,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Golden State Warriors",
                price: -160,
              },
              {
                name: "Houston Rockets",
                price: 135,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "97c436574586a603abfb5d3d649633a6",
    sport_key: "basketball_nba",
    sport_title: "NBA",
    commence_time: "2025-04-27T17:00:00Z",
    home_team: "Detroit Pistons",
    away_team: "New York Knicks",
    bookmakers: [
      {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-04-25T20:36:55Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:55Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -132,
              },
              {
                name: "New York Knicks",
                price: 112,
              },
            ],
          },
        ],
      },
      {
        key: "draftkings",
        title: "DraftKings",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -130,
              },
              {
                name: "New York Knicks",
                price: 110,
              },
            ],
          },
        ],
      },
      {
        key: "lowvig",
        title: "LowVig.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -130,
              },
              {
                name: "New York Knicks",
                price: 114,
              },
            ],
          },
        ],
      },
      {
        key: "betonlineag",
        title: "BetOnline.ag",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -132,
              },
              {
                name: "New York Knicks",
                price: 112,
              },
            ],
          },
        ],
      },
      {
        key: "mybookieag",
        title: "MyBookie.ag",
        last_update: "2025-04-25T20:36:54Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:36:54Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -128,
              },
              {
                name: "New York Knicks",
                price: 104,
              },
            ],
          },
        ],
      },
      {
        key: "betrivers",
        title: "BetRivers",
        last_update: "2025-04-25T20:38:25Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:25Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -125,
              },
              {
                name: "New York Knicks",
                price: 105,
              },
            ],
          },
        ],
      },
      {
        key: "bovada",
        title: "Bovada",
        last_update: "2025-04-25T20:38:27Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:27Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -130,
              },
              {
                name: "New York Knicks",
                price: 110,
              },
            ],
          },
        ],
      },
      {
        key: "betmgm",
        title: "BetMGM",
        last_update: "2025-04-25T20:38:24Z",
        markets: [
          {
            key: "h2h",
            last_update: "2025-04-25T20:38:24Z",
            outcomes: [
              {
                name: "Detroit Pistons",
                price: -135,
              },
              {
                name: "New York Knicks",
                price: 110,
              },
            ],
          },
        ],
      },
    ],
  },
];

const OddsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-center text-4xl font-bold">QUIQUE ODDSSSS</h1>
      {data.map((game) => (
        <div key={game.id} className="mb-10">
          <h2 className="mb-2 text-2xl font-bold">
            {game.away_team} @ {game.home_team}
          </h2>
          <p className="mb-4 text-gray-600">
            {new Date(game.commence_time).toLocaleString()}
          </p>

          <table className="w-full border text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Bookmaker</th>
                <th className="border p-2">{game.away_team}</th>
                <th className="border p-2">{game.home_team}</th>
              </tr>
            </thead>
            <tbody>
              {game.bookmakers.map((book) => {
                const h2h = book.markets.find((m) => m.key === "h2h");
                if (!h2h) return null;
                const [away, home] = h2h.outcomes;

                return (
                  <tr key={book.key}>
                    <td className="border p-2">{book.title}</td>
                    <td className="border p-2">{away?.price}</td>
                    <td className="border p-2">{home?.price}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default OddsPage;

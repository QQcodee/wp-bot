"use client";
import { useEffect, useState } from "react";

interface Outcome {
  name: string; // "Over" or "Under"
  description: string;
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

// Replace with your actual data
const playerPropsData: MatchData = {
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
      markets: [
        {
          key: "player_points_rebounds_assists_alternate",
          last_update: "2025-04-25T20:51:50Z",
          outcomes: [
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -2000,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -500,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -185,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -125,
              point: 41.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 135,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 310,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 700,
              point: 54.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 1900,
              point: 59.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -1600,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -390,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -140,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -115,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 185,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 475,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 1200,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -1200,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -310,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -110,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 235,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 650,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 1700,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: -550,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: -190,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: -130,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 135,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 330,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 800,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 2000,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -1000,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -280,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -125,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -105,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 250,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 600,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 1700,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -900,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -250,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -110,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 110,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 280,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 700,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 1800,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: -650,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: -150,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: -115,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 215,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 650,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 2000,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: -650,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: -155,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: -125,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 195,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 550,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 1800,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: -475,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: -115,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 285,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 1000,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: -310,
              point: 9.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: -115,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 155,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 600,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 2500,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: -280,
              point: 9.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: -115,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 150,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 500,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 1700,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: -600,
              point: 4.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: -110,
              point: 8.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 130,
              point: 9.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 600,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 2800,
              point: 19.5,
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
          key: "player_points_rebounds_assists_alternate",
          last_update: "2025-04-25T20:52:04Z",
          outcomes: [
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -1450,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -1200,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -900,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -670,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -550,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -440,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -350,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -290,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -240,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -200,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -166,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -136,
              point: 41.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -114,
              point: 42.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 104,
              point: 43.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 126,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 152,
              point: 45.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 178,
              point: 46.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 205,
              point: 47.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 235,
              point: 48.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 280,
              point: 49.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 290,
              point: 35.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 240,
              point: 36.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 205,
              point: 37.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 174,
              point: 38.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 148,
              point: 39.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 124,
              point: 40.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: 102,
              point: 41.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -114,
              point: 42.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -138,
              point: 43.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -166,
              point: 44.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -205,
              point: 45.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -245,
              point: 46.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -290,
              point: 47.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -340,
              point: 48.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -420,
              point: 49.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -500,
              point: 50.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -650,
              point: 51.5,
            },
            {
              name: "Under",
              description: "Paolo Banchero",
              price: -750,
              point: 52.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -1450,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -1100,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -750,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -580,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -440,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -340,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -275,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -225,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -186,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -154,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -125,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -102,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 118,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 148,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 178,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 205,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 240,
              point: 40.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: 235,
              point: 29.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: 198,
              point: 30.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: 164,
              point: 31.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: 138,
              point: 32.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: 116,
              point: 33.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -106,
              point: 34.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -130,
              point: 35.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -158,
              point: 36.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -200,
              point: 37.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -245,
              point: 38.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -290,
              point: 39.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -350,
              point: 40.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -450,
              point: 41.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -580,
              point: 42.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -700,
              point: 43.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -1000,
              point: 44.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -1400,
              point: 45.5,
            },
            {
              name: "Under",
              description: "Franz Wagner",
              price: -1800,
              point: 46.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -1600,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -1200,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -850,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -650,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -490,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -400,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -320,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -270,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -220,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -182,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -154,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -130,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -106,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 112,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 132,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 154,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 182,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 210,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 240,
              point: 41.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 270,
              point: 28.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 225,
              point: 29.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 194,
              point: 30.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 162,
              point: 31.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 136,
              point: 32.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: 116,
              point: 33.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -102,
              point: 34.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -125,
              point: 35.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -148,
              point: 36.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -178,
              point: 37.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -210,
              point: 38.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -250,
              point: 39.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -300,
              point: 40.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -350,
              point: 41.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -440,
              point: 42.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -500,
              point: 43.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -650,
              point: 44.5,
            },
            {
              name: "Under",
              description: "Jaylen Brown",
              price: -850,
              point: 45.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -1600,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -1100,
              point: 13.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -750,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -600,
              point: 15.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -450,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -350,
              point: 17.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -280,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -230,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -182,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -148,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -125,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -102,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 118,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 140,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 164,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 198,
              point: 27.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: 240,
              point: 17.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: 200,
              point: 18.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: 168,
              point: 19.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: 136,
              point: 20.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: 112,
              point: 21.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -106,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -130,
              point: 23.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -158,
              point: 24.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -188,
              point: 25.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -225,
              point: 26.5,
            },
            {
              name: "Under",
              description: "Payton Pritchard",
              price: -275,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -1600,
              point: 17.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -1200,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -850,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -600,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -470,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -390,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -310,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -245,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -200,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -160,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -130,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -106,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 116,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 140,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 164,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 194,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 230,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 280,
              point: 34.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: 265,
              point: 22.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: 220,
              point: 23.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: 178,
              point: 24.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: 148,
              point: 25.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: 120,
              point: 26.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -102,
              point: 27.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -125,
              point: 28.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -154,
              point: 29.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -186,
              point: 30.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -225,
              point: 31.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -270,
              point: 32.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -330,
              point: 33.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -420,
              point: 34.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -500,
              point: 35.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -650,
              point: 36.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -800,
              point: 37.5,
            },
            {
              name: "Under",
              description: "Derrick White",
              price: -1100,
              point: 38.5,
            },
          ],
        },
      ],
    },
    {
      key: "betonlineag",
      title: "BetOnline.ag",
      markets: [
        {
          key: "player_points_rebounds_assists_alternate",
          last_update: "2025-04-25T20:52:19Z",
          outcomes: [
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 200,
              point: 48.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 350,
              point: 52.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 270,
              point: 50.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 119,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 1650,
              point: 62.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -110,
              point: 42.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 155,
              point: 46.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 475,
              point: 54.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 850,
              point: 58.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 625,
              point: 56.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 1200,
              point: 60.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -172,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 1100,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 290,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 129,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 700,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 1800,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 3100,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 194,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: 450,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: -250,
              point: 17.5,
            },
            {
              name: "Over",
              description: "Wendell Carter Jr",
              price: -118,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 1450,
              point: 46.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 475,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 950,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 240,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 675,
              point: 42.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 330,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 170,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 2100,
              point: 48.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 122,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: -114,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: -204,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Kristaps Porzingis",
              price: 3300,
              point: 50.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 390,
              point: 45.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 220,
              point: 41.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 290,
              point: 43.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -175,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 1050,
              point: 51.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 122,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 525,
              point: 47.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 725,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -109,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 163,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 1450,
              point: 53.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 2100,
              point: 55.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 1400,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 139,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -227,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 330,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 525,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -110,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 210,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 825,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 2300,
              point: 42.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 4100,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 1800,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 2900,
              point: 51.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -175,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 725,
              point: 45.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 104,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 148,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 475,
              point: 43.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 220,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 1150,
              point: 47.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 320,
              point: 41.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 2000,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 1350,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 220,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: -122,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: -233,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 116,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 310,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 625,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 450,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 900,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 161,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Anthony Black",
              price: 3100,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 139,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 3000,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 575,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 220,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 1650,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 950,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: -286,
              point: 6.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: 350,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Cory Joseph",
              price: -115,
              point: 8.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 310,
              point: 18.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 200,
              point: 16.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: -244,
              point: 10.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 134,
              point: 14.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: -114,
              point: 12.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 3600,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 1250,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 775,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 2100,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Kentavious Caldwell-Pope",
              price: 475,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 100,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 575,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 850,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 1900,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: -179,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 195,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 138,
              point: 23.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 280,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 400,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 3000,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 1250,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Al Horford",
              price: 4900,
              point: 41.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 290,
              point: 32.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -200,
              point: 20.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 105,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 650,
              point: 38.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 380,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 875,
              point: 40.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 500,
              point: 36.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 230,
              point: 30.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 136,
              point: 26.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -125,
              point: 22.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 174,
              point: 28.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 1150,
              point: 42.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 2000,
              point: 35.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 1200,
              point: 33.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 210,
              point: 25.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 750,
              point: 31.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: -105,
              point: 21.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 3400,
              point: 37.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: -208,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 320,
              point: 27.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 475,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Jrue Holiday",
              price: 140,
              point: 23.5,
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
          key: "player_points_rebounds_assists_alternate",
          last_update: "2025-04-25T20:52:41Z",
          outcomes: [
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -305,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: -230,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 100,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: -130,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Derrick White",
              price: 210,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -180,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: -360,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -129,
              point: 34.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 145,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Jaylen Brown",
              price: 165,
              point: 39.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 110,
              point: 24.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 205,
              point: 49.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: 215,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Payton Pritchard",
              price: -195,
              point: 19.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: -250,
              point: 29.5,
            },
            {
              name: "Over",
              description: "Paolo Banchero",
              price: 110,
              point: 44.5,
            },
            {
              name: "Over",
              description: "Franz Wagner",
              price: 285,
              point: 44.5,
            },
          ],
        },
      ],
    },
  ],
};

type GroupedByPlayer = Record<
  string,
  Record<string, { over: Outcome[]; under: Outcome[] }>
>;

export default function PlayerPropsPage() {
  const [groupedProps, setGroupedProps] = useState<GroupedByPlayer>({});

  useEffect(() => {
    const grouped: GroupedByPlayer = {};

    playerPropsData.bookmakers.forEach((bookmaker) => {
      const market = bookmaker.markets.find((m) =>
        m.key.includes("player_points_rebounds_assists"),
      );
      if (!market) return;

      market.outcomes.forEach((outcome) => {
        const player = outcome.description;
        const provider = bookmaker.title;
        const isOver = outcome.name.toLowerCase() === "over";

        if (!grouped[player]) grouped[player] = {};
        if (!grouped[player][provider])
          grouped[player][provider] = { over: [], under: [] };

        if (isOver) {
          grouped[player][provider].over.push(outcome);
        } else {
          grouped[player][provider].under.push(outcome);
        }
      });
    });

    // Optional: sort each by point
    Object.values(grouped).forEach((providers) => {
      Object.values(providers).forEach(({ over, under }) => {
        over.sort((a, b) => a.point - b.point);
        under.sort((a, b) => a.point - b.point);
      });
    });

    setGroupedProps(grouped);
  }, []);

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Player Props (PRA)</h1>
      <div className="space-y-10">
        {Object.entries(groupedProps).map(([player, providers]) => (
          <div key={player}>
            <h2 className="mb-2 text-xl font-semibold">{player}</h2>
            <div className="ml-4 space-y-6">
              {Object.entries(providers).map(([provider, { over, under }]) => (
                <div key={provider}>
                  <h3 className="mb-2 text-lg font-medium text-gray-700">
                    {provider}
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="mb-1 font-semibold text-green-600">
                        Over
                      </h4>
                      <ul className="ml-4 list-disc">
                        {over.map((o, i) => (
                          <li key={i}>
                            {o.point} PRA:{" "}
                            {o.price > 0 ? `+${o.price}` : o.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-red-600">Under</h4>
                      <ul className="ml-4 list-disc">
                        {under.map((o, i) => (
                          <li key={i}>
                            {o.point} PRA:{" "}
                            {o.price > 0 ? `+${o.price}` : o.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

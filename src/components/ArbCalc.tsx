import { useState } from "react";

const ArbitrageCalculator = () => {
  const [stake, setStake] = useState(""); // Total stake as string to handle empty inputs
  const [bet1Odds, setBet1Odds] = useState(""); // Odds for bet 1 as string
  const [bet2Odds, setBet2Odds] = useState(""); // Odds for bet 2 as string
  const [bet1Stake, setBet1Stake] = useState(null); // Stake for bet 1
  const [bet2Stake, setBet2Stake] = useState(null); // Stake for bet 2
  const [profit, setProfit] = useState(null); // Potential profit

  const calculateArbitrage = () => {
    // Parse inputs to numbers
    const parsedStake = parseFloat(stake);
    const parsedBet1Odds = parseFloat(bet1Odds);
    const parsedBet2Odds = parseFloat(bet2Odds);

    // Validate inputs
    if (!parsedStake || !parsedBet1Odds || !parsedBet2Odds) {
      alert("Please enter valid numbers for stake and odds.");
      return;
    }

    // Calculate stake for Bet 1
    const stakeForBet1 = (
      parsedStake /
      (1 / parsedBet1Odds + 1 / parsedBet2Odds)
    ).toFixed(2);
    // Calculate stake for Bet 2
    const stakeForBet2 = (parsedStake - stakeForBet1).toFixed(2);

    // Calculate potential profit (assuming Bet 1 wins)
    const potentialProfit = (
      stakeForBet1 * parsedBet1Odds -
      parsedStake
    ).toFixed(2);

    // Update state with results
    setBet1Stake(stakeForBet1);
    setBet2Stake(stakeForBet2);
    setProfit(potentialProfit);
  };

  return (
    <div>
      <h1>Arbitrage Calculator</h1>
      <div>
        <label>Stake ($):</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="Enter total stake"
        />
      </div>
      <div>
        <label>Bet 1 Odds:</label>
        <input
          type="number"
          value={bet1Odds}
          onChange={(e) => setBet1Odds(e.target.value)}
          placeholder="Enter Bet 1 odds"
        />
      </div>
      <div>
        <label>Bet 2 Odds:</label>
        <input
          type="number"
          value={bet2Odds}
          onChange={(e) => setBet2Odds(e.target.value)}
          placeholder="Enter Bet 2 odds"
        />
      </div>
      <button onClick={calculateArbitrage}>Calculate</button>

      {bet1Stake !== null && bet2Stake !== null && profit !== null && (
        <div>
          <h2>Results:</h2>
          <p>Stake for Bet 1: ${bet1Stake}</p>
          <p>Stake for Bet 2: ${bet2Stake}</p>
          <p>Potential Profit: ${profit}</p>
        </div>
      )}
    </div>
  );
};

export default ArbitrageCalculator;

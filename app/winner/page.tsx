"use client";
import React, { useContext, useEffect } from "react";
import Style from "./Winner.module.css";
import { VotingContext, IVotingContextValue } from "../context/voter";
import WinnerCard from "../components/WinnerCard/WinnerCard";
import Button from "../components/Button/Button";

const Winner: React.FC = () => {
  const {
    startVotingPeriod,
    endVotingPeriod,
    determineWinner,
    winnerInfo,
    currentAccount,
    checkCurrentAccount,
  } = useContext(VotingContext) as IVotingContextValue;

  console.log("Current Account:", currentAccount);

  const organizerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const isOrganizer = currentAccount === organizerAddress.toLowerCase();

  useEffect(() => {
    checkCurrentAccount();
  }, []);

  const handleStartVoting = () => {
    startVotingPeriod();
  };

  const handleEndVoting = () => {
    endVotingPeriod();
  };

  const handleDetermineWinner = () => {
    determineWinner();
  };

  return (
    <div className={Style.winner}>
      <div className={Style.winner_title}>
        <h1>Winner</h1>
      </div>
      <div className={Style.button_container}>
        {isOrganizer && (
          <>
            <Button btnName="Start Voting" handleClick={handleStartVoting} />
            <Button btnName="End Voting" handleClick={handleEndVoting} />
            <Button
              btnName="Determine Winner"
              handleClick={handleDetermineWinner}
            />
          </>
        )}
        {!isOrganizer && (
          <div className={Style.button_container_voter}>
            <Button
              btnName="Determine Winner"
              handleClick={handleDetermineWinner}
            />
          </div>
        )}
      </div>
      <div className={Style.card_container}>
        {winnerInfo ? (
          <WinnerCard winnerInfo={winnerInfo} />
        ) : (
          <p> No winner Selected </p>
        )}
      </div>
    </div>
  );
};

export default Winner;

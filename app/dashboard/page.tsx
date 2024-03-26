"use client";
import React, { useContext, useEffect, useState } from "react";
import Style from "./Dashboard.module.css";
import {
  VotingContext,
  IVotingContextValue,
  ICandidateData,
} from "../context/voter";
import WinnerCard from "../components/WinnerCard/WinnerCard";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";

const Winner: React.FC = () => {
  const {
    startVotingPeriod,
    endVotingPeriod,
    determineWinner,
    winnerInfo,
    currentAccount,
    checkCurrentAccount,
    votingStarted,
    getVotingStatus,
    votingStatus,
  } = useContext(VotingContext) as IVotingContextValue;

  const organizerAddress = process.env.NEXT_PUBLIC_ORGANIZER_ADDRESS;
  const isOrganizer = currentAccount === organizerAddress?.toLowerCase();

  useEffect(() => {
    checkCurrentAccount();
    getVotingStatus();
  }, [getVotingStatus]);

  const [loading, setLoading] = useState(false);

  console.log(votingStarted);

  const handleStartVoting = async () => {
    setLoading(true);
    try {
      await startVotingPeriod();
    } catch (error) {
      console.error("Error starting voting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndVoting = async () => {
    setLoading(true);
    try {
      await endVotingPeriod();
    } catch (error) {
      console.error("Error ending voting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetermineWinner = async () => {
    setLoading(true);
    try {
      await determineWinner();
    } catch (error) {
      console.error("Error determining winner:", error);
    } finally {
      setLoading(false);
    }
  };

  const isWinnerInfoValid = (info: ICandidateData | null): boolean => {
    if (!info) return false;
    return !!info.name && !!info.imageUrl;
  };

  return (
    <div className={Style.winner}>
      <div className={Style.winner_title}>
        <h1>Dashboard</h1>
      </div>
      <div>
        <h2>{votingStatus}</h2>
      </div>
      <div className={Style.button_container}>
        {isOrganizer && (
          <>
            {!votingStarted && (
              <Button
                btnName="Start Voting"
                handleClick={handleStartVoting}
                disabled={loading}
              />
            )}
            {votingStarted && (
              <Button
                btnName="End Voting"
                handleClick={handleEndVoting}
                disabled={loading}
              />
            )}
            <Button
              btnName="Determine Winner"
              handleClick={handleDetermineWinner}
              disabled={loading}
            />
          </>
        )}
        {!isOrganizer && (
          <div className={Style.button_container_voter}>
            <Button
              btnName="Determine Winner"
              handleClick={handleDetermineWinner}
              disabled={loading}
            />
          </div>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {!votingStarted && winnerInfo && isWinnerInfoValid(winnerInfo) && (
            <div className={Style.card_container}>
              <WinnerCard winnerInfo={winnerInfo} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Winner;

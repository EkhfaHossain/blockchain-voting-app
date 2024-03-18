"use client";
import React, { useContext, useEffect } from "react";
import Style from "./index.module.css";
import { VotingContext, IVotingContextValue } from "./context/voter";
import Countdown from "react-countdown";
import Card from "./components/Card/Card";

const home = () => {
  const {
    getAllVoterData,
    getAllCandidateData,
    candidateArray,
    checkIfWalletIsConnected,
    candidateLength,
    currentAccount,
    voterLength,
    giveVote,
  } = useContext(VotingContext) as IVotingContextValue;

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllVoterData();
    getAllCandidateData();
  }, []);

  return (
    <div className={Style.home}>
      {currentAccount && (
        <div className={Style.winner}>
          <div className={Style.winner_info}>
            <div className={Style.candidate_list}>
              <p>
                Candidate: <span>{candidateLength}</span>
              </p>
            </div>
            <div className={Style.candidate_list}>
              <p>
                Voter: <span>{voterLength}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      <Card candidateArray={candidateArray} giveVote={giveVote}></Card>
    </div>
  );
};

export default home;

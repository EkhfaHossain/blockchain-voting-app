"use client";
import React, { useState, useContext, useEffect } from "react";
import Style from "./index.module.css";
import { VotingContext, IVotingContextValue } from "./context/voter";
import Card from "./components/Card/Card";

const home = () => {
  const {
    checkCurrentAccount,
    getAllVoterData,
    getAllCandidateData,
    candidateArray,
    checkIfWalletIsConnected,
    candidateLength,
    currentAccount,
    voterLength,
    giveVote,
    getVotingStatus,
    votingStatus,
  } = useContext(VotingContext) as IVotingContextValue;

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCurrentAccount();
    getAllVoterData();
    getAllCandidateData();
    getVotingStatus();
  }, []);

  console.log("Voting Status:", votingStatus);

  return (
    <div className={Style.home}>
      {currentAccount && (
        <div className={Style.winner}>
          <div className={Style.winner_info}>
            <div className={Style.candidate_list}>
              <p>
                Candidate:<span>{candidateLength}</span>
              </p>
            </div>
            <div className={Style.candidate_list}>
              <p>
                Voter:<span>{voterLength}</span>
              </p>
            </div>
          </div>
          <div className={Style.voting_status}>
            <p>{votingStatus}</p>
          </div>
        </div>
      )}
      <Card candidateArray={candidateArray} giveVote={giveVote}></Card>
    </div>
  );
};

export default home;

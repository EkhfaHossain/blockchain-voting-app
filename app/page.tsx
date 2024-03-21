"use client";
import React, { useState, useContext, useEffect } from "react";
import Style from "./index.module.css";
import { VotingContext, IVotingContextValue } from "./context/voter";
import Countdown from "react-countdown";
import Card from "./components/Card/Card";

const home = () => {
  const {
    error,
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
                Candidate:<span>{candidateLength}</span>
              </p>
            </div>
            <div className={Style.candidate_list}>
              <p>
                Voter:<span>{voterLength}</span>
              </p>
            </div>
          </div>
          <div className={Style.winner_message}>
            <small>
              <Countdown date={Date.now() + 100000} />
            </small>
          </div>
        </div>
      )}
      <Card candidateArray={candidateArray} giveVote={giveVote}></Card>
    </div>
  );
};

export default home;

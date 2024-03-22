"use client";
import React, { useState, useEffect, useContext } from "react";
import VoterCard from "../components/VoterCard/VoterCard";
import Style from "./VoterList.module.css";
import {
  VotingContext,
  IVotingContextValue,
  IVoterData,
} from "../context/voter";

const VoterList: React.FC = () => {
  const { voterArray, getAllVoterData } = useContext(
    VotingContext
  ) as IVotingContextValue;

  useEffect(() => {
    getAllVoterData();
  }, []);

  return (
    <div className={Style.voterList}>
      <VoterCard voterArray={voterArray} />
    </div>
  );
};

export default VoterList;

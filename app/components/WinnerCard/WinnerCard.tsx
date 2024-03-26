import React from "react";
import Style from "../Card/Card.module.css";
import Image from "next/image";
import { ICandidateData } from "../../context/voter";

interface IWinnerCardProps {
  winnerInfo: ICandidateData | null;
}

const WinnerCard: React.FC<IWinnerCardProps> = ({ winnerInfo }) => {
  return (
    <div className={Style.card}>
      {winnerInfo ? (
        <div className={Style.card_box}>
          <div className={Style.image}>
            <img src={winnerInfo.imageUrl} alt="profile photo" />
          </div>
          <div className={Style.card_info}>
            <h2>{winnerInfo.name}</h2>
            <p>Address: {winnerInfo.ethereumAddress.slice(0, 10)}...</p>
            <p>Age: {winnerInfo.age}</p>
            <p>Total Vote: {winnerInfo.voteCount.toString()}</p>
          </div>
        </div>
      ) : (
        <p>No winner selected yet</p>
      )}
    </div>
  );
};

export default WinnerCard;

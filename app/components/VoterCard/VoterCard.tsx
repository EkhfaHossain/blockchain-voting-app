import React from "react";
import Style from "../Card/Card.module.css";
import voterCardStyle from "./VoterCard.module.css";
import Image from "next/image";
import { VoterData } from "../../context/voter";

interface IVoterCardProps {
  voterArray: VoterData[];
}

const VoterCard: React.FC<IVoterCardProps> = ({ voterArray }) => {
  return (
    <div className={Style.card}>
      {voterArray.map((el, i) => (
        <div className={Style.card_box} key={i}>
          <div className={Style.image}>
            <img src={el.imageUrl} alt="profilee photo" />
          </div>
          <div className={Style.card_info}>
            <h2>{el.name}</h2>
            <p>Adress: {el.ethereumAddress.slice(0, 30)}...</p>
            <p> Details</p>
            <p className={voterCardStyle.vote_Status}>
              {el.voterVoted == true ? "You already voted" : "Not Voted"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VoterCard;

"use client";
import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import { VotingContext, IVotingContextValue } from "../../context/voter";
import Style from "./Navbar.module.css";
import loadingImage from "../../../assets/loading.gif";
import path from "path";

const Navbar = () => {
  const { connectWallet, error, currentAccount } = useContext(
    VotingContext
  ) as IVotingContextValue;

  const [openNav, setOpenNav] = useState(true);

  const openNavigation = () => {
    if (openNav) {
      setOpenNav(false);
    } else if (!openNav) {
      setOpenNav(true);
    }
  };
  return (
    <div className={Style.navbar}>
      {error == "" ? (
        ""
      ) : (
        <div className={Style.message_box}>
          <div className={Style.message}>
            <p> {error}</p>
          </div>
        </div>
      )}
      <div className={Style.navbar_box}>
        <div className={Style.title}>
          <Link href={{ pathname: "/" }}></Link>
        </div>
        <div className={Style.connect}>
          {currentAccount ? (
            <div>
              <div className={Style.connect_flex}>
                <button onClick={() => openNavigation()}>
                  {currentAccount.slice(0, 10)}..
                </button>
                {currentAccount && (
                  <span>
                    {openNav ? (
                      <AiFillUnlock onClick={() => openNavigation()} />
                    ) : (
                      <AiFillLock onClick={() => openNavigation()} />
                    )}
                  </span>
                )}
              </div>
              {openNav && (
                <div className={Style.navigation}>
                  <p>
                    <Link href={{ pathname: "/" }}>Home</Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "candidate-registration" }}>
                      Candidate Registration
                    </Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "allowed-voters" }}>
                      Voter Registration
                    </Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "voter-list" }}>Voter List</Link>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => connectWallet()}> Connect Wallet </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
"use client";
import React, { useState, useEffect } from "react";
import Web3modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { VotingAddress, VotingAddressABI } from "./constants";

interface VotingProviderProps {
  children: React.ReactNode;
}

interface VoterForm {
  name: string;
  address: string;
  position: string;
}

interface CandidateForm {
  name: string;
  address: string;
  age: string;
}

export interface CandidateData {
  age: string;
  name: string;
  candidateId: bigint;
  imageUrl: string;
  voteCount: bigint;
  ipfsUrl: string;
  ethereumAddress: string;
}

export interface VoterData {
  voterId: bigint;
  name: string;
  imageUrl: string;
  ipfsUrl: string;
  voterAllowed: bigint;
  voterVoted: boolean;
  ethereumAddress: string;
}

export interface IVotingContextValue {
  votingTitle: string;
  checkIfWalletIsConnected: () => void;
  connectWallet: () => void;
  uploadToIPFS: (file: File) => Promise<string>;
  createVoter: (voterForm: VoterForm, fileUrl: string, router: any) => void;
  getAllVoterData: () => void;
  setCandidate: (
    candidateForm: CandidateForm,
    fileUrl: string,
    router: any
  ) => void;
  getAllCandidateData: () => void;
  error: string;
  voterArray: VoterData[];
  voterLength: string;
  voterAddress: any[];
  currentAccount: string;
  candidateLength: string;
  candidateArray: CandidateData[];
  uploadToIPFSCandidate: (file: File) => Promise<string>;
  giveVote: (id: any) => void;
}

const fetchContract = (signerOrProvider: any) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext<
  IVotingContextValue | undefined
>(undefined);

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const votingTitle = "My first Smart Contract App";
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");
  const pushCandidate: CandidateData[] = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState(pushCandidate);
  const [error, setError] = useState("");
  const highestVote = [];

  const pushVoter: VoterData[] = [];
  const [voterArray, setVoterArray] = useState(pushVoter);
  const [voterLength, setVoterLength] = useState<string>("");
  const [voterAddress, setVoterAddress] = useState<string[]>([]);

  // Connecting Metamask

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install Metamask");

    const account = await window.ethereum.request({ method: "eth_accounts" });
    if (account.length) {
      setCurrentAccount(account[0]);
    } else {
      setError("Please Install Metamask to connect or Reload");
    }
  };

  console.log("Candidate Array: ", candidateArray);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please Install Metamask");
    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setCurrentAccount(account[0]);
  };

  //Upload to IPFS Voter Image
  const uploadToIPFS = async (file: File): Promise<string> => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `1b3a6e198de72bcb2792`,
            pinata_secret_api_key: `bad5701dbf486a2ff7d437271e127b21bca6892e7f75df1e719712302614ddad`,
            "Content-Type": "multipart/form-data",
          },
        });

        // console.log("Pinata Response:", response.data);
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.log("Unable to upload Image to Pinata");
        throw new Error("Unable to upload Image to Pinata");
      }
    }
    throw new Error("File is not provided");
  };

  //-------- Create Voter ---------//

  const createVoter = async (
    formInput: VoterForm,
    fileUrl: string,
    router: any
  ): Promise<void> => {
    try {
      const { name, address, position } = formInput;

      if (!name || !address || !position) {
        return console.log("Input Data is missing");
      }

      console.log("Input Data:", name, address, position, fileUrl);

      // Connecting Smart Contract
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ name, address, position, image: fileUrl });
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `1b3a6e198de72bcb2792`,
          pinata_secret_api_key: `bad5701dbf486a2ff7d437271e127b21bca6892e7f75df1e719712302614ddad`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      const voter = await contract.voterRight(address, name, url, fileUrl);
      console.log("Transaction hash:", voter.hash);
      console.log("Voter Info: ", voter);
      await voter.wait();
      console.log("Transaction mined");
      router.push("/voter-list");
    } catch (error) {
      setError("Error in creating Voter");
      console.error("Error creating voter:", error);
    }
  };

  //-------- Get Voter Data ---------//

  const getAllVoterData = async () => {
    try {
      // Connecting Smart Contract
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const voterListData: string[] = await contract.getVoterList();
      console.log("All Vote Data:", voterListData);
      setVoterAddress(voterListData);
      const updatedVoterArray: VoterData[] = [];
      for (const el of voterListData) {
        const singleVoterData = await contract.getVoterdata(el);
        console.log("Single Voter Data:", singleVoterData);
        pushVoter.push(singleVoterData);
        const voterData: VoterData = {
          voterId: singleVoterData[0],
          name: singleVoterData[1],
          imageUrl: singleVoterData[4],
          voterAllowed: singleVoterData[5],
          voterVoted: singleVoterData[6],
          ipfsUrl: singleVoterData[2],
          ethereumAddress: singleVoterData[3],
        };
        updatedVoterArray.push(voterData);
      }

      setVoterArray(updatedVoterArray);

      const voterList = await contract.getVoterLength();
      setVoterLength(voterList.toString());
    } catch (error) {
      setError("Something went wrong while fetching data");
      console.error("Something went wrong while fetching data", error);
    }
  };

  //-------- Give vote ---------//

  const giveVote = async (id: any) => {
    try {
      // Connecting Smart Contract
      const voterAddress = id.address;
      const voterId = id.id;
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const voteredList = await contract.vote(voterAddress, voterId);
      console.log(voteredList);
    } catch (error) {
      setError("Something went wrong while giving vote");
      console.error("Something went wrong while giving vote", error);
    }
  };

  //------- Candidate Section ---------//

  //Upload to IPFS Candidate Image
  const uploadToIPFSCandidate = async (file: File): Promise<string> => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `1b3a6e198de72bcb2792`,
            pinata_secret_api_key: `bad5701dbf486a2ff7d437271e127b21bca6892e7f75df1e719712302614ddad`,
            "Content-Type": "multipart/form-data",
          },
        });

        // console.log("Pinata Response:", response.data);
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.log("Unable to upload Image to Pinata");
        throw new Error("Unable to upload Image to Pinata");
      }
    }
    throw new Error("File is not provided");
  };

  const setCandidate = async (
    candidateForm: CandidateForm,
    fileUrl: string,
    router: any
  ): Promise<void> => {
    try {
      const { name, address, age } = candidateForm;

      if (!name || !address || !age) {
        return setError("Input Data is missing");
      }

      console.log("Input Data:", name, address, age, fileUrl);

      // Connecting Smart Contract
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ address, age, name, image: fileUrl });
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `1b3a6e198de72bcb2792`,
          pinata_secret_api_key: `bad5701dbf486a2ff7d437271e127b21bca6892e7f75df1e719712302614ddad`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      const candidate = await contract.setCandidate(
        address,
        age,
        name,
        url,
        fileUrl
      );
      console.log("Transaction hash:", candidate.hash);
      console.log("Candidate Info: ", candidate);
      await candidate.wait();
      router.push("/");
    } catch (error) {
      setError("Error in creating candidate");
      console.error("Error creating candidate:", error);
    }
  };

  const getAllCandidateData = async () => {
    try {
      // Connecting Smart Contract
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const allCandidateData: string[] = await contract.getCandidate();
      console.log("All Candidate Data:", allCandidateData);

      const updatedCandidateArray: CandidateData[] = [];

      for (const el of allCandidateData) {
        const singleCandidateData = await contract.getCandidatedata(el);
        console.log("Single Candidate Data: ", singleCandidateData);
        pushCandidate.push(singleCandidateData);
        const candidateIdAsNumber = Number(singleCandidateData[2]);
        candidateIndex.push(candidateIdAsNumber);
        const candidateData: CandidateData = {
          candidateId: singleCandidateData[2],
          name: singleCandidateData[1],
          age: singleCandidateData[0],
          imageUrl: singleCandidateData[5],
          voteCount: singleCandidateData[4],
          ipfsUrl: singleCandidateData[3],
          ethereumAddress: singleCandidateData[6],
        };
        updatedCandidateArray.push(candidateData);
      }

      setCandidateArray(updatedCandidateArray);

      //----- Candidate Length ---------//
      const allCandidateLength = await contract.getCandidateLength();
      setCandidateLength(allCandidateLength.toString());
    } catch (error) {
      setError("Error in fetching candidate data");
    }
  };

  return (
    <VotingContext.Provider
      value={{
        votingTitle,
        checkIfWalletIsConnected,
        connectWallet,
        uploadToIPFS,
        createVoter,
        getAllVoterData,
        setCandidate,
        getAllCandidateData,
        error,
        voterArray,
        voterLength,
        voterAddress,
        currentAccount,
        candidateLength,
        candidateArray,
        uploadToIPFSCandidate,
        giveVote,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

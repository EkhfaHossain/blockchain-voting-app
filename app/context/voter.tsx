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

interface FormInput {
  name: string;
  address: string;
  position: string;
}

interface CandidateForm {
  name: string;
  address: string;
  age: string;
}

export interface IVotingContextValue {
  votingTitle: string;
  checkIfWalletIsConnected: () => void;
  connectWallet: () => void;
  uploadToIPFS: (file: File) => Promise<string>;
  createVoter: (formInput: FormInput, fileUrl: string, router: any) => void;
  getAllVoterData: () => void;
  setCandidate: (
    candidateForm: CandidateForm,
    fileUrl: string,
    router: any
  ) => void;
  getAllCandidateData: () => void;
  error: string;
  voterArray: string[];
  voterLength: string;
  voterAddress: any[];
  currentAccount: string;
  candidateLength: string;
  candidateArray: string[];
  uploadToIPFSCandidate: (file: File) => Promise<string>;
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
  const pushCandidate: string[] = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState(pushCandidate);
  const [error, setError] = useState("");
  const highestVote = [];

  const pushVoter: string[] = [];
  const [voterArray, setVoterArray] = useState(pushVoter);
  const [voterLength, setVoterLength] = useState("");
  const [voterAddress, setVoterAddress] = useState([]);

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
            pinata_api_key: `3bf9f01d86d0dc27853c`,
            pinata_secret_api_key: `fe80536528d1a49dca334a1372336cd9951e130647f34b819f328ecd467afdd6`,
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
    formInput: FormInput,
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
          pinata_api_key: `3bf9f01d86d0dc27853c`,
          pinata_secret_api_key: `fe80536528d1a49dca334a1372336cd9951e130647f34b819f328ecd467afdd6`,
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

      // Voter List
      const voterListData = await contract.getVoterList();
      setVoterAddress(voterListData);

      voterListData.map(async (el: any) => {
        const singleVoterData = await contract.getVoterdata(el);
        pushVoter.push(singleVoterData);
        setVoterArray(pushVoter);
      });

      // voter length
      const voterList = await contract.getVoterLength();
      const numLength = voterList.toString();
      console.log(numLength);
      setVoterLength(numLength);
    } catch (error) {
      setError("Something went wrong while fetching data");
      console.error("Something went wrong while fetching data", error);
    }
  };

  //-------- Give vote ---------//

  const giveVote = async () => {
    try {
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
            pinata_api_key: `3bf9f01d86d0dc27853c`,
            pinata_secret_api_key: `fe80536528d1a49dca334a1372336cd9951e130647f34b819f328ecd467afdd6`,
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
          pinata_api_key: `3bf9f01d86d0dc27853c`,
          pinata_secret_api_key: `fe80536528d1a49dca334a1372336cd9951e130647f34b819f328ecd467afdd6`,
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

      const allCandidateData = await contract.getCandidate();
      console.log(allCandidateData);

      allCandidateData.map(async (el: any) => {
        const singleCandidateData = await contract.getCandidatedata(el);
        pushCandidate.push(singleCandidateData);
        console.log("Push Candidate Console: ", pushCandidate);
        //console.log(singleCandidateData);
        const value = Number(singleCandidateData[2]);
        candidateIndex.push(value);
      });

      //----- Candidate Length ---------//
      const allCandidateLength = await contract.getCandidateLength();
      const numLength = allCandidateLength.toString();
      setCandidateLength(numLength);
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
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

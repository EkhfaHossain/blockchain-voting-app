"use client";
import React, { useState, useEffect } from "react";
import Web3modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { VotingAddress, VotingAddressABI } from "./constants";

interface IVotingProviderProps {
  children: React.ReactNode;
}

interface IVoterForm {
  name: string;
  address: string;
  position: string;
}

interface ICandidateForm {
  name: string;
  address: string;
  age: string;
}

export interface ICandidateData {
  age: string;
  name: string;
  candidateId: bigint;
  imageUrl: string;
  voteCount: bigint;
  ipfsUrl: string;
  ethereumAddress: string;
}

export interface IVoterData {
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
  checkCurrentAccount: () => void;
  uploadToIPFS: (file: File) => Promise<string>;
  createVoter: (voterForm: IVoterForm, fileUrl: string, router: any) => void;
  getAllVoterData: () => void;
  setCandidate: (
    candidateForm: ICandidateForm,
    fileUrl: string,
    router: any
  ) => void;
  getAllCandidateData: () => void;
  error: string;
  voterArray: IVoterData[];
  voterLength: string;
  voterAddress: any[];
  currentAccount: string;
  candidateLength: string;
  candidateArray: ICandidateData[];
  uploadToIPFSCandidate: (file: File) => Promise<string>;
  giveVote: (id: any) => void;
  startVotingPeriod: () => void;
  endVotingPeriod: () => void;
  determineWinner: () => void;
  winnerInfo: ICandidateData | null;
  getVotingStatus: () => void;
  votingStatus: string;
}

const fetchContract = (signerOrProvider: any) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext<
  IVotingContextValue | undefined
>(undefined);

export const VotingProvider: React.FC<IVotingProviderProps> = ({
  children,
}) => {
  const votingTitle = "My first Smart Contract App";
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");
  const pushCandidate: ICandidateData[] = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState(pushCandidate);
  const [error, setError] = useState("");
  const highestVote = [];

  const pushVoter: IVoterData[] = [];
  const [voterArray, setVoterArray] = useState(pushVoter);
  const [voterLength, setVoterLength] = useState<string>("");
  const [voterAddress, setVoterAddress] = useState<string[]>([]);
  const [winnerInfo, setWinnerInfo] = useState<ICandidateData | null>(null);
  const [votingStatus, setVotingStatus] = useState<string>("");

  // Connecting Metamask

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install Metamask");

    const account = await window.ethereum.request({ method: "eth_accounts" });
    if (account.length) {
      setCurrentAccount(account[0]);
    } else {
      setError(
        "Please Install MetaMask to connect and reload the page to start"
      );
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

  const checkCurrentAccount = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async () => {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setCurrentAccount(accounts[0]);
      });
    }
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
    formInput: IVoterForm,
    fileUrl: string,
    router: any
  ): Promise<void> => {
    try {
      const { name, address, position } = formInput;

      if (!name || !address || !position) {
        return console.log("Input Data is missing");
      }

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
      await voter.wait();
      router.push("/voter-list");
    } catch (error: any) {
      let errorMessage = "An error occurred while creating the voter.";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
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
      setVoterAddress(voterListData);
      const updatedVoterArray: IVoterData[] = [];
      for (const el of voterListData) {
        const singleVoterData = await contract.getVoterdata(el);
        pushVoter.push(singleVoterData);
        const voterData: IVoterData = {
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
    } catch (error: any) {
      console.error("Something went wrong while fetching data", error);
    }
  };

  //-------- Give vote ---------//

  const giveVote = async (id: any) => {
    try {
      const { address, id: candidateId } = id;
      const voterAddress = id.address;
      const voterId = id.id;
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      const voteredList = await contract.vote(voterAddress, voterId);

      const updatedCandidateArray = candidateArray.map((candidate) => {
        if (candidate.candidateId === candidateId) {
          return {
            ...candidate,
            voteCount: candidate.voteCount + BigInt(1),
          };
        }
        return candidate;
      });
      setCandidateArray(updatedCandidateArray);
      toast.success("Vote Casted Successfully");
    } catch (error: any) {
      let errorMessage = "Something went wrong while giving vote";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
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
        console.error("Unable to upload Image to Pinata");
        throw new Error("Unable to upload Image to Pinata");
      }
    }
    throw new Error("File is not provided");
  };

  const setCandidate = async (
    candidateForm: ICandidateForm,
    fileUrl: string,
    router: any
  ): Promise<void> => {
    try {
      const { name, address, age } = candidateForm;

      if (!name || !address || !age) {
        return setError("Input Data is missing");
      }
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
      await candidate.wait();
      router.push("/");
    } catch (error: any) {
      let errorMessage = "Something went wrong while creating candidate";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
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
      const updatedCandidateArray: ICandidateData[] = [];

      for (const el of allCandidateData) {
        const singleCandidateData = await contract.getCandidatedata(el);
        pushCandidate.push(singleCandidateData);
        const candidateIdAsNumber = Number(singleCandidateData[2]);
        candidateIndex.push(candidateIdAsNumber);
        const candidateData: ICandidateData = {
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
    } catch (error: any) {
      console.log("Error in fetching Candidate Data", error);
    }
  };

  const startVotingPeriod = async () => {
    try {
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);
      const startVoting = await contract.startVotingPeriod();
      await startVoting.wait();
    } catch (error: any) {
      let errorMessage = "An error occurred while starting the voting period:";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
    }
  };

  const endVotingPeriod = async () => {
    try {
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);
      const endVoting = await contract.endVotingPeriod();
      await endVoting.wait();
    } catch (error: any) {
      let errorMessage = "An error occurred while ending the voting period:";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
    }
  };

  const determineWinner = async () => {
    try {
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const contract = fetchContract(provider);

      const winnerInfo = await contract.getWinnerInfo();
      console.log("Winner Info:", winnerInfo);

      setWinnerInfo({
        candidateId: winnerInfo[0],
        name: winnerInfo[1],
        age: winnerInfo[2],
        imageUrl: winnerInfo[6],
        voteCount: winnerInfo[4],
        ipfsUrl: winnerInfo[3],
        ethereumAddress: winnerInfo[5],
      });
    } catch (error: any) {
      let errorMessage = "An error occurred while determining the winner:";
      if (error.reason) {
        errorMessage = error.reason.toString();
      } else if (error.message) {
        errorMessage = error.message.toString();
      }
      toast.error(errorMessage);
    }
  };

  const getVotingStatus = async () => {
    try {
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const contract = fetchContract(provider);
      const status = await contract.getVotingStatus();
      setVotingStatus(status);
    } catch (error: any) {
      console.error("An error occurred while fetching voting status:", error);
      toast.error("An error occurred while fetching voting status");
    }
  };

  return (
    <VotingContext.Provider
      value={{
        votingTitle,
        checkIfWalletIsConnected,
        checkCurrentAccount,
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
        startVotingPeriod,
        endVotingPeriod,
        determineWinner,
        winnerInfo,
        getVotingStatus,
        votingStatus,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

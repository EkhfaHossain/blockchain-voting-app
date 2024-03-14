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
  fetchVotingOrganizer: () => void;
  getAllVoterData: () => void;
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
  const [votingOrganizer, setVotingOrganizer] = useState<string>("");

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

  const fetchVotingOrganizer = async (): Promise<void> => {
    try {
      if (window.ethereum) {
        const web3Modal = new Web3modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.BrowserProvider(connection);
        const contract = new ethers.Contract(
          VotingAddress,
          VotingAddressABI,
          provider
        );

        const organizer: string = await contract.votingOrganizer();
        console.log("Voting Organizer:", organizer);
        setVotingOrganizer(organizer);
      } else {
        console.error("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error("Error fetching voting organizer:", error);
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
      console.log(voterAddress);

      voterListData.map(async (el: any) => {
        const singleVoterData = await contract.getVoterdata(el);
        pushCandidate.push(singleVoterData);
        console.log(singleVoterData);
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

  useEffect(() => {
    getAllVoterData();
  }, []);

  return (
    <VotingContext.Provider
      value={{
        votingTitle,
        checkIfWalletIsConnected,
        connectWallet,
        uploadToIPFS,
        createVoter,
        fetchVotingOrganizer,
        getAllVoterData,
      }}
    >
      {children}
      <div>Voting Organizer: {votingOrganizer}</div>
    </VotingContext.Provider>
  );
};

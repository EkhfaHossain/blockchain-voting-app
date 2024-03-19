"use client";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { VotingContext, IVotingContextValue } from "../context/voter";
import Button from "../components/Button/Button";
import Style from "./allowedVoter.module.css";
import Input from "../components/Input/Input";

interface CandidateForm {
  name: string;
  address: string;
  age: string;
}

const candidateRegistration: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [candidateForm, setCandidateForm] = useState<CandidateForm>({
    name: "",
    address: "",
    age: "",
  });

  const router = useRouter();
  const {
    uploadToIPFSCandidate,
    setCandidate,
    candidateArray,
    getAllCandidateData,
  } = useContext(VotingContext) as IVotingContextValue;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const url = await uploadToIPFSCandidate(acceptedFiles[0]);
    setFileUrl(url);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/jpeg": [".jpeg"],
    },
    maxSize: 5000000,
  });

  useEffect(() => {
    getAllCandidateData();
    console.log("Candidate Array", candidateArray);
  }, []);

  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="Voter Image" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span> &nbps; {candidateForm.name}</span>
              </p>
              <p>
                Address:{" "}
                <span> &nbps; {candidateForm.address.slice(0, 20)}</span>
              </p>
              <p>
                Age: <span> &nbps; {candidateForm.age}</span>
              </p>
            </div>
          </div>
        )}
        {!fileUrl && (
          <div className={Style.sideInfo}>
            <div className={Style.sideInfo_box}>
              <h4> Create candidate for Voting </h4>
              <p className={Style.sideInfo_para}> Contract Candidate List </p>
            </div>
            <div className={Style.card}>
              {candidateArray.map((el, i) => (
                <div key={i + 1} className={Style.card_box}>
                  <div className={Style.image}>
                    <img src={el.imageUrl} alt="Profile Photo" />
                  </div>
                  <div className={Style.card_info}>
                    <p> {el.name} </p>
                    <p> Address: {el.ethereumAddress.slice(0, 10)}.. </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={Style.voter}>
        <div className={Style.voter_container}>
          <h1> Create New Candidate</h1>
          <div className={Style.voter_container_box}>
            <div className={Style.voter_container_box_div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className={Style.voter_container_box_div_info}>
                  <p>Upload File: JPG PNG, GIF max 10MB</p>
                  <div className={Style.voter_container_box_div_image}>
                    <Image
                      src="/upload.png"
                      alt="File Upload"
                      width={150}
                      height={150}
                      objectFit="contain"
                    />
                  </div>
                  <p> Drag and Drop Files </p>
                  <p> Browse Media on your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={Style.input_container}>
          <Input
            inputType="text"
            title="Name"
            placeholder="Candidate Name"
            handleclick={(e) =>
              setCandidateForm({ ...candidateForm, name: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Candidate Address"
            handleclick={(e) =>
              setCandidateForm({ ...candidateForm, address: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Age"
            placeholder="Candidate Age"
            handleclick={(e) =>
              setCandidateForm({ ...candidateForm, age: e.target.value })
            }
          />
          <div className={Style.Button}>
            <Button
              btnName="Authorized Candidate"
              handleClick={() => {
                if (fileUrl) {
                  setCandidate(candidateForm, fileUrl, router);
                } else {
                  console.log("File URL is null. Cannot create candidate.");
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className={Style.createdVoter}>
        <div className={Style.createdVoter_info}>
          <Image
            src="/create.jpg"
            alt="user profile"
            width={150}
            height={150}
          />
          <p> Notice for User</p>
          <p>
            Organizer <span> 0X9334567....</span>
          </p>
          <p>
            Only Organizer of the Voter contract can create Candidate for voting
            Application
          </p>
        </div>
      </div>
    </div>
  );
};

export default candidateRegistration;

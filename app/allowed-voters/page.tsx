"use client";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { VotingContext, IVotingContextValue } from "../context/voter";
import Button from "../components/Button/Button";
import Style from "./allowedVoter.module.css";
import Input from "../components/Input/Input";
import fileUploadImage from "../../assets/upload.png";
import staticImage from "../../assets/create.jpg";

interface IFormInput {
  name: string;
  address: string;
  position: string;
}

const allowedVoters: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, setFormInput] = useState<IFormInput>({
    name: "",
    address: "",
    position: "",
  });

  const router = useRouter();
  const { uploadToIPFS, createVoter, voterArray, getAllVoterData } = useContext(
    VotingContext
  ) as IVotingContextValue;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const url = await uploadToIPFS(acceptedFiles[0]);
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
    getAllVoterData();
    console.log("Voter Array", voterArray);
  }, []);

  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="Voter Image" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span> &nbps; {formInput.name}</span>
              </p>
              <p>
                Address: <span> &nbps; {formInput.address.slice(0, 20)}</span>
              </p>
              <p>
                Position: <span> &nbps; {formInput.position}</span>
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
              {voterArray.map((el, i) => (
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
          <h1> Create New Voter</h1>
          <div className={Style.voter_container_box}>
            <div className={Style.voter_container_box_div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className={Style.voter_container_box_div_info}>
                  <p>Upload File: JPG PNG, GIF max 10MB</p>
                  <div className={Style.voter_container_box_div_image}>
                    <Image
                      src={fileUploadImage}
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
            placeholder="Voter Name"
            handleclick={(e) =>
              setFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Voter Address"
            handleclick={(e) =>
              setFormInput({ ...formInput, address: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Position"
            placeholder="Voter Position"
            handleclick={(e) =>
              setFormInput({ ...formInput, position: e.target.value })
            }
          />
          <div className={Style.Button}>
            <Button
              btnName="Authorized Voter"
              handleClick={() => {
                if (fileUrl) {
                  createVoter(formInput, fileUrl, router);
                } else {
                  console.log("File URL is null. Cannot create voter.");
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className={Style.createdVoter}>
        <div className={Style.createdVoter_info}>
          <Image
            src={staticImage}
            alt="user profile"
            width={150}
            height={150}
          />
          <p> Notice for User</p>
          <p>
            Organizer <span> 0X9334567....</span>
          </p>
          <p>
            Only Organizer of the Voter contract can create Voter & Candidate
            for voting Application
          </p>
        </div>
      </div>
    </div>
  );
};

export default allowedVoters;

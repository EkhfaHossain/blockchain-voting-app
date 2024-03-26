import React, { useContext } from "react";
import Style from "./Input.module.css";

interface IInputProps {
  inputType: string;
  title: string;
  placeholder: string;
  handleclick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<IInputProps> = ({
  inputType,
  title,
  placeholder,
  handleclick,
}) => {
  return (
    <div className={Style.input}>
      <p> {title}</p>
      {inputType === "text" ? (
        <div className={Style.input_box}>
          <input
            type="text"
            className={Style.input_box_form}
            placeholder={placeholder}
            onChange={handleclick}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Input;

import React from "react";
import Style from "./Button.module.css";

interface IButtonProps {
  btnName: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<IButtonProps> = ({ btnName, handleClick }) => (
  <button className={Style.button} type="button" onClick={handleClick}>
    {btnName}
  </button>
);
export default Button;

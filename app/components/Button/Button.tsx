import React from "react";
import Style from "./Button.module.css";

interface IButtonProps {
  btnName: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button: React.FC<IButtonProps> = ({ btnName, handleClick, disabled }) => (
  <button
    className={Style.button}
    type="button"
    onClick={handleClick}
    disabled={disabled}
  >
    {btnName}
  </button>
);
export default Button;

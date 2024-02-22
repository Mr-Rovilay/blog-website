import { useState } from "react";

const InputBox = ({ name, type, placeholder, id, value, icon }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className="relative w-[100%] mb-4">
      <input
        className="input-box"
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        name={name}
        placeholder={placeholder}
        id={id}
        defaultValue={value}
      />
      <i className={"fi " + icon + " input-icon"}></i>

      {type == "password" ? (
        <i
          className={
            "fi fi-rr-eye" +
            (!passwordVisible ? "-crossed " : "") +
            " input-icon left-[auto] right-4 cursor-pointer"
          }
          onClick={() => setPasswordVisible((currentValue) => !currentValue)}
        ></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;

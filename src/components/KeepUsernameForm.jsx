import React from "react";
import { keepUsername } from "../firebase";
import useAuthContext from "../hooks/useAuthContext";

const KeepUsernameForm = ({ username, onChange, onSuccess }) => {
  const auth = useAuthContext();

  return (
    <form style={{ padding: 10, textAlign: "center" }}>
      <p style={{ padding: 0, margin: 0 }}>
        Are you sure this will be your username forever
      </p>
      <h2>u/{username}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          className="primary-btn"
          onClick={async (e) => {
            e.preventDefault();
            await keepUsername(auth?.uid);
            onSuccess();
          }}
        >
          Keep Username
        </button>
        <button className="tertiary-btn" onClick={onChange}>
          Change Username
        </button>
      </div>
    </form>
  );
};

export default KeepUsernameForm;

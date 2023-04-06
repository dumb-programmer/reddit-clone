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
          data-testid="keep-username-btn-final"
          className="primary-btn"
          onClick={async (e) => {
            e.preventDefault();
            await keepUsername(auth?.uid);
            onSuccess();
          }}
        >
          Keep Username
        </button>
        <button
          data-testid="change-username-btn-final"
          className="tertiary-btn"
          onClick={(e) => {
            e.preventDefault();
            onChange();
          }}
        >
          Change Username
        </button>
      </div>
    </form>
  );
};

export default KeepUsernameForm;

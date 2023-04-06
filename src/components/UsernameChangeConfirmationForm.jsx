import React from "react";
import { changeUsername } from "../firebase";
import useAuthContext from "../hooks/useAuthContext";

const UsernameChangeConfirmationForm = ({ username, onBack, onSuccess }) => {
  const auth = useAuthContext();

  return (
    <form style={{ textAlign: "center", padding: 10 }}>
      <p>Are you sure? This will be your username forever.</p>
      <h2>u/{username}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          className="primary-btn"
          onClick={async (e) => {
            e.preventDefault();
            await changeUsername(auth?.uid, username);
            onSuccess();
          }}
        >
          Save username
        </button>
        <button
          className="tertiary-btn"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          Go back
        </button>
      </div>
    </form>
  );
};

export default UsernameChangeConfirmationForm;

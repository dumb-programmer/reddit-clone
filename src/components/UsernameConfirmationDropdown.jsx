import { useState } from "react";
import ChangeUsernameModal from "./ChangeUsernameModal";
import KeepUsernameModal from "./KeepUsernameModal";

const UsernameConfirmationDropdown = ({ username }) => {
  const [modal, setModal] = useState("");

  return (
    <>
      <div
        className="change-username-dropdown"
        style={{
          position: "absolute",
          top: 60,
          right: 5,
          backgroundColor: "#fff",
          zIndex: 2,
          padding: 20,
          textAlign: "center",
          maxWidth: 350,
          borderTop: "10px solid var(--clr-primary)",
          borderRadius: "5px",
        }}
      >
        <p>Do you want to change or keep this user name?</p>
        <h2>u/{username}</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "0 20px",
          }}
        >
          <button className="primary-btn" onClick={() => setModal("change")}>
            Change Username
          </button>
          <button className="tertiary-btn" onClick={() => setModal("keep")}>
            Keep Username
          </button>
        </div>
      </div>
      {modal === "change" && (
        <ChangeUsernameModal onClose={() => setModal("")} />
      )}
      {modal === "keep" && (
        <KeepUsernameModal
          username={username}
          onChangeUsername={() => setModal("change")}
          onClose={() => setModal("")}
        />
      )}
    </>
  );
};

export default UsernameConfirmationDropdown;

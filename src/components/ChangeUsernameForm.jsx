import RefreshIcon from "./icons/RefreshIcon";
import generateUsernames from "../utils/generateUsernames";
import { useState } from "react";
import UsernameChangeConfirmationForm from "./UsernameChangeConfirmationForm";
import { usernameAvailable } from "../firebase";
import LoadingSVG from "./LoadingSVG";

const ChangeUsernameForm = ({ onSuccess }) => {
  const [suggestedUsernames, setSuggestedUsernames] = useState(() =>
    generateUsernames(3)
  );
  const [username, setUsername] = useState("");
  const [formContinue, setFormContinue] = useState(false);
  const [usernameNotAvailable, setUsernameNotAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    if (usernameNotAvailable) {
      setUsernameNotAvailable(false);
    }
    setUsername(e.target.value);
  };

  if (formContinue) {
    return (
      <UsernameChangeConfirmationForm
        username={username}
        onBack={() => setFormContinue(false)}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: 10,
      }}
    >
      <div style={{ position: "relative" }}>
        <span
          style={{ position: "absolute", top: 13, left: 12, color: "grey" }}
        >
          u/
        </span>
        <input
          data-testid="username-input"
          style={{ width: "100%", paddingLeft: 27 }}
          className={`form-input${
            usernameNotAvailable ? " form-input__error" : ""
          }`}
          value={username}
          onChange={handleInput}
          onBlur={() => {
            if (usernameNotAvailable) {
              setUsernameNotAvailable(false);
            }
          }}
        />
        {usernameNotAvailable && (
          <div className="error-message">That username is already taken</div>
        )}
      </div>
      <div className="username-suggestions" data-testid="username-suggestions">
        <p>
          Can't think of one use one of these{" "}
          <button
            id="generate-usernames-btn"
            onClick={(e) => {
              e.preventDefault();
              setSuggestedUsernames(generateUsernames(3));
            }}
          >
            <RefreshIcon style={{ height: 16, width: 16, stroke: "#0079d3" }} />
          </button>
        </p>
        {suggestedUsernames.map((suggestion, idx) => (
          <p
            key={idx}
            className="username-suggestion"
            onClick={() => {
              if (usernameNotAvailable) {
                setUsernameNotAvailable(false);
              }
              setUsername(suggestion);
            }}
          >
            {suggestion}
          </p>
        ))}
      </div>
      <button
        className="primary-btn"
        onClick={async (e) => {
          e.preventDefault();
          setLoading(true);
          const isUsernameAvailable = await usernameAvailable(username);
          setUsernameNotAvailable(!isUsernameAvailable);
          if (isUsernameAvailable) {
            setFormContinue(true);
          }
          setLoading(false);
        }}
        disabled={!username || usernameNotAvailable}
      >
        {!loading ? "Continue" : <LoadingSVG />}
      </button>
    </form>
  );
};

export default ChangeUsernameForm;

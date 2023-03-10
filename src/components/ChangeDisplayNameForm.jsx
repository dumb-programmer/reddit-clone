import { useState } from "react";
import { updateDisplayName } from "../firebase";

const ChangeDisplayNameForm = ({ onSuccess }) => {
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );

  const hasChanged =
    localStorage.getItem("displayName") !== displayName &&
    displayName.length > 0;

  const handleBlur = async () => {
    if (hasChanged) {
      await updateDisplayName(displayName);
      localStorage.setItem("displayName", displayName);
      onSuccess();
    }
  };

  return (
    <>
      <div>
        <h4>Display name (optional)</h4>
        <p className="small-text">
          Set a display name. This does not change your username
        </p>
      </div>
      <div>
        <input
          className="form-input"
          type="text"
          placeholder="Display name (optional)"
          style={{ width: "100%" }}
          value={displayName}
          onChange={(e) => {
            if (e.target.value.length < 31) {
              setDisplayName(e.target.value);
            }
          }}
          onBlur={handleBlur}
        />
        <p className="small-text">
          {30 - displayName.length} characters remaining
        </p>
      </div>
    </>
  );
};

export default ChangeDisplayNameForm;

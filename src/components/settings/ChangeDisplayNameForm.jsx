import { useEffect, useState } from "react";
import { subscribeToUserDoc, updateDisplayName } from "../../firebase";
import useAuthContext from "../../hooks/useAuthContext";

const ChangeDisplayNameForm = ({ onSuccess }) => {
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );
  const auth = useAuthContext();

  const hasChanged =
    localStorage.getItem("displayName") !== displayName &&
    displayName?.length > 0;

  const handleBlur = async () => {
    if (hasChanged) {
      await updateDisplayName(displayName);
      localStorage.setItem("displayName", displayName);
      onSuccess();
    }
  };

  useEffect(() => {
    let unsubUser = null;

    if (auth) {
      unsubUser = subscribeToUserDoc(auth?.uid, (doc) => {
        setDisplayName(doc?.data()?.displayName || "");
      });
    }

    return () => {
      if (unsubUser) {
        unsubUser();
      }
    };
  }, [auth]);

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
          data-testid="displayName-input"
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
        <p
          data-testid="displayName-remaining-characters"
          className="small-text"
        >
          {30 - displayName?.length} characters remaining
        </p>
      </div>
    </>
  );
};

export default ChangeDisplayNameForm;

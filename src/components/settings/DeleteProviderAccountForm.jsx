import { useState } from "react";
import { deleteAccount, reauthenticatedWithAuthProvider } from "../../firebase";
import useRedirect from "../../hooks/useRedirect";
import LoadingSVG from "../LoadingSVG";

const DeleteProviderAccountForm = ({ provider, onCancel }) => {
  const [reauthenticated, setReauthenticated] = useState(false);
  const navigateToHome = useRedirect("/", "Account deleted successfully");
  const [loading, setLoading] = useState(false);

  if (reauthenticated) {
    return (
      <div>
        <p>
          Are you sure? Once you delete your account, your profile and username
          are permanently removed.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: 30,
          }}
        >
          <button
            className="secondary-btn"
            style={{ minWidth: 80 }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="primary-btn danger-btn"
            style={{ minWidth: 80 }}
            onClick={async () => {
              setLoading(true);
              await deleteAccount();
              navigateToHome();
              setLoading(false);
            }}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 350 }}>
      <p>Please verify that you want to delete your account</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <button
          className="secondary-btn"
          style={{ minWidth: 80 }}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          style={{
            minWidth: 80,
          }}
          className="primary-btn"
          onClick={
            !loading
              ? () => {
                  setLoading(true);
                  reauthenticatedWithAuthProvider(provider, () => {
                    setReauthenticated(true);
                    setLoading(false);
                  });
                }
              : null
          }
        >
          {!loading ? "Verify" : <LoadingSVG />}
        </button>
      </div>
    </div>
  );
};

export default DeleteProviderAccountForm;

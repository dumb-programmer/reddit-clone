import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityNameAvailable, createCommunity } from "../firebase";
import useAuthContext from "../hooks/useAuthContext";
import LoadingSVG from "./LoadingSVG";

const CreateCommunityModal = ({ username, onExit }) => {
  const [data, setData] = useState({
    communityName: "",
    communityType: "public",
  });
  const [communityNameNotAvailable, setCommunityNameNotAvailable] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthContext();

  const remainingCharacters = 21 - data.communityName.length;

  const handleInput = (e) => {
    if (e.target.name === "communityName" && e.target.value.length < 22) {
      setData({
        ...data,
        communityName: e.target.value,
      });
    } else if (e.target.name === "communityType") {
      setData({
        ...data,
        communityType: e.target.value,
      });
    }
    if (communityNameNotAvailable) {
      setCommunityNameNotAvailable(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (await communityNameAvailable(data)) {
      await createCommunity(
        data.communityName,
        data.communityType,
        username,
        auth.uid
      );
      navigate(`/r/${data.communityName}`);
    } else {
      setCommunityNameNotAvailable(true);
    }
    setLoading(false);
  };

  return (
    <div className="modal-container">
      <div className="modal">
        <header className="modal-header">
          <h4>Create a community</h4>
          <button className="close-modal-btn" onClick={onExit}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c7c7c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body">
          <form>
            <h4>Name</h4>
            <p style={{ color: "#afafaf", fontSize: "12px" }}>
              Community names including capitalization cannot be changed.
            </p>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  top: 7,
                  left: 10,
                  color: "#afafaf",
                }}
              >
                r/
              </span>
              <input
                type="text"
                name="communityName"
                className="form-input"
                style={{ width: "93%", padding: 8, paddingLeft: 22 }}
                maxLength="21"
                value={data.communityName}
                onChange={handleInput}
              />
              {communityNameNotAvailable && (
                <div className="error-message" style={{ marginTop: 5 }}>
                  Sorry, r/{data.communityName} is taken. Try another.
                </div>
              )}
            </div>
            <p
              style={{
                color: `${remainingCharacters !== 0 ? "#afafaf" : "#ea072c"} `,
                fontSize: "12px",
              }}
            >
              {remainingCharacters} characters remaining
            </p>
            <h4>Community type</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label>
                <input
                  type="radio"
                  name="communityType"
                  value="public"
                  onChange={handleInput}
                  checked={data.communityType === "public"}
                />{" "}
                Public{" "}
                <span style={{ color: "#afafaf", fontSize: "12px" }}>
                  Anyone can view, post, and comment to this community
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="communityType"
                  value="restricted"
                  onChange={handleInput}
                  checked={data.communityType === "restricted"}
                />{" "}
                Restricted{" "}
                <span style={{ color: "#afafaf", fontSize: "12px" }}>
                  Anyone can view, post, and comment to this community
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="communityType"
                  value="private"
                  onChange={handleInput}
                  checked={data.communityType === "private"}
                />{" "}
                Private{" "}
                <span style={{ color: "#afafaf", fontSize: "12px" }}>
                  Only approved users can view and submit to this community
                </span>
              </label>
            </div>
          </form>
        </div>
        <footer className="modal-footer">
          <button
            className="primary-btn"
            onClick={!loading ? handleSubmit : null}
            style={{
              width: 120,
              height: 20,
              borderRadius: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!loading ? (
              "Create Community"
            ) : (
              <LoadingSVG height={35} width={35} />
            )}
          </button>
          <button
            className="secondary-btn"
            style={{ height: 20, borderRadius: 20 }}
            onClick={onExit}
            disabled={loading}
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateCommunityModal;

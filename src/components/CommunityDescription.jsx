import { useState } from "react";
import { updateCommunityDescription } from "../firebase";
import EditIcon from "./icons/EditIcon";
import useAuthContext from "../hooks/useAuthContext";
import "../styles/CommunityDescription.css";

const CommunityDescription = ({ community }) => {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState(community.description || "");
  const auth = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (community?.description !== text) {
      await updateCommunityDescription(community.name, community.type, text);
    }
    setShowForm(false);
  };

  const remainingCharactersLength = 500 - text.length;

  const isModerator = auth?.uid === community.moderatorId;

  if (!community?.description || showForm) {
    return (
      <div className="add-description" onClick={() => setShowForm(true)}>
        {!showForm ? (
          <p>Add Description</p>
        ) : (
          <form
            style={{
              position: "relative",
              paddingBottom: 25,
            }}
            onSubmit={handleSubmit}
          >
            <textarea
              style={{ width: "100%", minHeight: 100 }}
              onChange={(e) => {
                if (e.target.value.length < 501) {
                  setText(e.target.value);
                }
              }}
              value={text}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span
                data-testid="remaining-characters"
                className={`small-text ${
                  remainingCharactersLength === 0 ? "danger-text" : ""
                }`}
              >
                {remainingCharactersLength} character
                {remainingCharactersLength > 1 ||
                remainingCharactersLength === 0
                  ? "s"
                  : ""}{" "}
                remaining
              </span>
              <div style={{ display: "flex" }}>
                <button
                  className="cancel-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
                <button className="save-btn">Save</button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
  return (
    <p
      className={`${isModerator ? "community-description" : ""}`}
      onClick={isModerator ? () => setShowForm(true) : null}
    >
      {community?.description}
      {isModerator && (
        <EditIcon
          style={{ height: 20, width: 20, stroke: "#1181d5", strokeWidth: 2 }}
        />
      )}
    </p>
  );
};

export default CommunityDescription;

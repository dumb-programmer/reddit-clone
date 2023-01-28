import { useContext, useRef, useState } from "react";
import { downvote, removeDownvote, removeUpvote, upvote } from "../firebase";
import AuthContext from "../context/AuthContext";
import isUpvoted from "../utils/isUpvoted";
import isDownvoted from "../utils/isDownvoted";

const Vote = ({ data, type }) => {
  const user = useContext(AuthContext);
  const ignore = useRef(false);

  const [userVote, setUserVote] = useState(() => {
    if (isUpvoted(data.upvotes, user.uid)) {
      return 1;
    } else if (isDownvoted(data.downvotes, user.uid)) {
      return -1;
    }
    return 0;
  });

  const handleUpvote = async () => {
    if (!ignore.current) {
      ignore.current = true;
      if (isUpvoted(data.upvotes, user.uid) || userVote === 1) {
        setUserVote(0);
        await removeUpvote(data.id, user.uid, type);
      } else {
        setUserVote(1);
        if (userVote === -1) {
          // The content is already downvoted
          await upvote(data.id, user.uid, true, type);
        } else {
          // The content is in neutral state
          await upvote(data.id, user.uid, false, type);
        }
      }
      ignore.current = false;
    }
  };

  const handleDownvote = async () => {
    if (!ignore.current) {
      ignore.current = true;
      if (isDownvoted(data.downvotes, user.uid) || userVote === -1) {
        setUserVote(0);
        await removeDownvote(data.id, user.uid, type);
      } else {
        setUserVote(-1);
        if (userVote === 1) {
          // The content is already upvoted
          await downvote(data.id, user.uid, true, type);
        } else {
          // The content is in neutral state
          await downvote(data.id, user.uid, false, type);
        }
      }
      ignore.current = false;
    }
  };

  return (
    <>
      <button
        className={`upvote-btn ${userVote === 1 ? "upvote-btn__clicked" : ""}`}
        onClick={handleUpvote}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-arrow-up"
        >
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
      <p
        style={
          userVote !== 0
            ? { color: userVote === 1 ? "#ff4500" : "#7193ff" }
            : null
        }
      >
        {data?.votes}
      </p>
      <button
        className={`downvote-btn ${
          userVote === -1 ? "downvote-btn__clicked" : ""
        }`}
        onClick={handleDownvote}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-arrow-down"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </button>
    </>
  );
};

export default Vote;

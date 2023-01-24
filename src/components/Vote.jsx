import { useContext, useState } from "react";
import { downvote, removeDownvote, removeUpvote, upvote } from "../firebase";
import AuthContext from "../context/AuthContext";

const Vote = ({ data }) => {
  const user = useContext(AuthContext);
  const isUpvoted = data?.upvotes.includes(user?.uid) || false;
  const isDownvoted = data?.downvotes.includes(user?.uid) || false;

  const [vote, setVote] = useState(() => {
    if (isUpvoted) {
      return 1;
    } else if (isDownvoted) {
      return -1;
    }
    return 0;
  });

  const handleUpvote = async () => {
    if (isUpvoted || vote === 1) {
      await removeUpvote(data.id, user.uid);
      setVote((prevState) => --prevState);
    } else {
      await upvote(data.id, user.uid);
      setVote((prevState) => ++prevState);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoted || vote === -1) {
      await removeDownvote(data.id, user.uid);
      setVote((prevState) => ++prevState);
    } else {
      await downvote(data.id, user.uid);
      setVote((prevState) => --prevState);
    }
  };

  return (
    <>
      <button
        className={`upvote-btn ${vote === 1 ? "upvote-btn__clicked" : ""}`}
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
          vote === 1 || vote === -1
            ? { color: vote === 1 ? "#ff4500" : "#7193ff" }
            : null
        }
      >
        {vote}
      </p>
      <button
        className={`downvote-btn ${vote === -1 ? "downvote-btn__clicked" : ""}`}
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

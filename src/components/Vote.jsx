import { useContext, useEffect, useState } from "react";
import { downvote, removeDownvote, removeUpvote, upvote } from "../firebase";
import AuthContext from "../context/AuthContext";

const Vote = ({ data }) => {
  const user = useContext(AuthContext);
  const isUpvoted = data?.upvotes.includes(user?.uid) || false;
  const isDownvoted = data?.downvotes.includes(user?.uid) || false;

  const [userVote, setUserVote] = useState("");

  const [votes, setVotes] = useState("");

  const handleUpvote = async () => {
    if (isUpvoted || userVote === 1) {
      await removeUpvote(data.id, user.uid);
      setVotes((prev) => --prev);
      setUserVote(0);
    } else {
      if (userVote === -1) {
        // The post is already downvoted
        await upvote(data.id, user.uid, true);
        setVotes((prev) => prev + 2);
      } else {
        // The post is in neutral state
        await upvote(data.id, user.uid, false);
        setVotes((prev) => ++prev);
      }
      setUserVote(1);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoted || userVote === -1) {
      await removeDownvote(data.id, user.uid);
      setVotes((prev) => ++prev);
      setUserVote(0);
    } else {
      if (userVote === 1) {
        // The post is already upvoted
        await downvote(data.id, user.uid, true);
        setVotes((prev) => prev - 2);
      } else {
        // The post is in neutral state
        await downvote(data.id, user.uid, false);
        setVotes((prev) => --prev);
      }
      setUserVote(-1);
    }
  };

  useEffect(() => {
    if (data) {
      setVotes(data?.votes);
      setUserVote(() => {
        if (isUpvoted) {
          return 1;
        } else if (isDownvoted) {
          return -1;
        }
        return 0;
      });
    }
  }, [data, isDownvoted, isUpvoted]);

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
        {votes}
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

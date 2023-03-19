import { useRef, useState } from "react";
import { downvote, removeDownvote, removeUpvote, upvote } from "../firebase";
import isUpvoted from "../utils/isUpvoted";
import isDownvoted from "../utils/isDownvoted";
import useRedirect from "../hooks/useRedirect";
import useAuthContext from "../hooks/useAuthContext";
import UpArrowIcon from "./icons/UpArrowIcon";
import DownArrowIcon from "./icons/DownArrowIcon";
import "../styles/Vote.css";

const Vote = ({ data, type }) => {
  const user = useAuthContext();
  const ignore = useRef(false);
  const redirectToLogin = useRedirect("/login", "You need to login first");

  const [userVote, setUserVote] = useState(() => {
    if (user) {
      if (isUpvoted(data.upvotes, user.uid)) {
        return 1;
      } else if (isDownvoted(data.downvotes, user.uid)) {
        return -1;
      }
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
        data-testid="upvote-btn"
        className={`upvote-btn ${userVote === 1 ? "upvote-btn__clicked" : ""}`}
        onClick={user ? handleUpvote : redirectToLogin}
      >
        <UpArrowIcon style={{ height: 24, width: 24 }} />
      </button>
      <p
        data-testid="votes"
        style={
          userVote !== 0
            ? { color: userVote === 1 ? "#ff4500" : "#7193ff" }
            : null
        }
      >
        {data?.votes}
      </p>
      <button
        data-testid="downvote-btn"
        className={`downvote-btn ${
          userVote === -1 ? "downvote-btn__clicked" : ""
        }`}
        onClick={user ? handleDownvote : redirectToLogin}
      >
        <DownArrowIcon style={{ height: 24, width: 24 }} />
      </button>
    </>
  );
};

export default Vote;

import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { hasJoinedCommunity, joinCommunity, leaveCommunity } from "../firebase";

const JoinCommunityButton = ({ communityName, communityType, ...props }) => {
  const [joined, setJoined] = useState(null);
  const auth = useContext(AuthContext);

  const handleJoin = () => {
    if (!joined) {
      joinCommunity(auth?.uid, communityName, communityType);
    } else {
      leaveCommunity(auth?.uid, communityName, communityType);
    }
    setJoined((prev) => !prev);
  };

  useEffect(() => {
    let ignore = false;
    if (auth) {
      hasJoinedCommunity(auth.uid, communityName).then((data) => {
        if (!ignore) {
          setJoined(data);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [auth, communityName]);

  return (
    <button
      className={`${joined ? "secondary-btn" : "primary-btn"}`}
      onClick={auth ? handleJoin : null}
      {...props}
    >
      {joined ? "Joined" : "Join"}
    </button>
  );
};

export default JoinCommunityButton;

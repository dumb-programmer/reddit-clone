import { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import {
  hasJoinedCommunity,
  joinCommunity,
  leaveCommunity,
} from "../../firebase";
import useAuthContext from "../../hooks/useAuthContext";
import useRedirect from "../../hooks/useRedirect";

const JoinCommunityButton = ({ communityName, communityType, ...props }) => {
  const [joined, setJoined] = useState(null);
  const auth = useAuthContext();
  const redirectToLogin = useRedirect("/login", "You need to login first");

  const handleJoin = (e) => {
    e.stopPropagation();
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
      return () => {
        ignore = true;
      };
    }
  }, [auth, communityName]);

  if (auth && joined === null) {
    return (
      <ContentLoader
        speed={2}
        width={120}
        height={51}
        viewBox="0 0 120 51"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="279" y="87" rx="0" ry="0" width="2" height="0" />
        <rect x="1" y="12" rx="15" ry="15" width="100" height="30" />
      </ContentLoader>
    );
  }

  return (
    <button
      className={`${joined ? "secondary-btn" : "primary-btn"}`}
      onClick={auth ? handleJoin : redirectToLogin}
      {...props}
    >
      {joined ? "Joined" : "Join"}
    </button>
  );
};

export default JoinCommunityButton;

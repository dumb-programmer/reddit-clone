import Header from "./Header";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  getCommunityInfo,
  getPostsByCommunity,
  hasJoinedCommunity,
  joinCommunity,
  leaveCommunity,
} from "../firebase";
import "../styles/Community.css";
import Post from "./Post";
import AuthContext from "../context/AuthContext";
import CommunityInfo from "./CommunityInfo";

const Community = () => {
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState(null);
  const [communityNotFound, setCommunityNotFound] = useState(false);
  const [joined, setJoined] = useState(false);
  const user = useContext(AuthContext);
  const { communityName } = useParams();

  const handleJoin = () => {
    if (!joined) {
      joinCommunity(user.uid, communityName, community.type);
    } else {
      leaveCommunity(user.uid, communityName, community.type);
    }
    setJoined((prev) => !prev);
  };

  useEffect(() => {
    let ignore = false;

    getCommunityInfo(communityName).then((snapshot) => {
      if (!ignore) {
        if (snapshot) {
          setCommunity(snapshot);
        } else {
          setCommunityNotFound(true);
        }
      }
    });

    if (user) {
      hasJoinedCommunity(user.uid, communityName).then((data) => {
        if (!ignore) {
          setJoined(data);
        }
      });
    }

    getPostsByCommunity(communityName).then((snap) => {
      if (!ignore) {
        setPosts(snap);
      }
    });

    return () => {
      ignore = true;
    };
  }, [communityName, user]);

  if (communityNotFound) {
    return (
      <>
        <Header />
        <main
          style={{
            backgroundColor: "#dae0e6",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h2>Sorry, there aren't any communities with that name.</h2>
          <h5>
            This community may have been banned or the community name is
            incorrect
          </h5>
        </main>
      </>
    );
  }

  const loading = !community && !posts && !joined;

  return (
    <div>
      {!loading && (
        <div className="community-header">
          <div className="community-banner" />
          <div className="community-info" style={{ marginLeft: 90 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              height="70"
              width="70"
              style={{
                marginTop: -20,
                fill: "#0079d3",
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: 5,
              }}
            >
              <path d="M16.5,2.924,11.264,15.551H9.91L15.461,2.139h.074a9.721,9.721,0,1,0,.967.785ZM8.475,8.435a1.635,1.635,0,0,0-.233.868v4.2H6.629V6.2H8.174v.93h.041a2.927,2.927,0,0,1,1.008-.745,3.384,3.384,0,0,1,1.453-.294,3.244,3.244,0,0,1,.7.068,1.931,1.931,0,0,1,.458.151l-.656,1.558a2.174,2.174,0,0,0-1.067-.246,2.159,2.159,0,0,0-.981.215A1.59,1.59,0,0,0,8.475,8.435Z"></path>
            </svg>
            <h2>{community?.name}</h2>
            <span
              style={{
                position: "absolute",
                top: 50,
                left: 98,
                fontSize: 12,
                color: "#afafaf",
                fontWeight: "bolder",
              }}
            >
              r/{community?.name}
            </span>
            <button
              className={`${joined ? "secondary-btn" : "primary-btn"}`}
              style={{ width: 80 }}
              onClick={handleJoin}
            >
              {joined ? "Joined" : "Join"}
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "1rem",
          marginTop: 20,
        }}
      >
        <div style={{ maxWidth: 800 }}>
          {!loading &&
            posts?.map((post) => (
              <Post key={post.id} id={post.id} data={post.data()} />
            ))}
        </div>
        {!loading && <CommunityInfo data={community} />}
      </div>
    </div>
  );
};

export default Community;

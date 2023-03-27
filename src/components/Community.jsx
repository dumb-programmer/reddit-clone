import { useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCommunityDoc,
  getPostsByCommunity,
  subscribeToCommunity,
  updateCommunityBanner,
  updateCommunityIcon,
} from "../firebase";
import CommunityInfo from "./CommunityInfo";
import JoinCommunityButton from "./JoinCommunityButton";
import Posts from "./Posts";
import ContentLoader from "react-content-loader";
import useAuthContext from "../hooks/useAuthContext";
import ProgressToast from "./ProgressToast";
import "../styles/Community.css";

const Community = () => {
  const { communityName } = useParams();
  const [communityDoc, setCommunityDoc] = useState(null);
  const [posts, setPosts] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressText, setProgressText] = useState("Uploading icon");
  const [uploadStatus, setUploadStatus] = useState(null);
  const auth = useAuthContext();
  const iconInput = useRef();
  const bannerInput = useRef();

  const community = communityDoc?.data();

  const onSuccess = useCallback((text) => {
    setProgressText(text);
    setUploadStatus("success");
    setTimeout(() => setProgress(null), 1800);
  }, []);

  const onError = useCallback((error) => {
    console.log(error);
  }, []);

  useEffect(() => {
    let ignore = false;

    getCommunityDoc(communityName).then((snapshot) => {
      if (!ignore) {
        setCommunityDoc(snapshot);
      }
    });

    getPostsByCommunity(communityName).then((snap) => {
      if (!ignore) {
        setPosts(snap);
      }
    });

    return () => {
      ignore = true;
    };
  }, [communityName]);

  useEffect(() => {
    let ignore = false;
    let unsubCommunity = null;
    if (community?.type) {
      unsubCommunity = subscribeToCommunity(
        communityName,
        community?.type,
        (snap) => {
          if (!ignore) {
            setCommunityDoc(snap);
          }
        }
      );
    }

    return () => {
      ignore = true;
      unsubCommunity && unsubCommunity();
    };
  }, [communityName, community?.type]);

  if (communityDoc && !communityDoc?._document) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h2>Sorry, there aren't any communities with that name.</h2>
        <h5>
          This community may have been banned or the community name is incorrect
        </h5>
      </div>
    );
  }

  const loading = !community && !posts;
  const isModerator = community?.moderatorId === auth?.uid;

  return (
    <div>
      <div className="community-header">
        <div
          className="community-banner"
          style={{
            cursor: isModerator ? "pointer" : "auto",
            backgroundImage: `url(${community?.banner})`,
            backgroundSize: "cover",
            backgroundPosition: "50%",
          }}
          onClick={
            isModerator && !(uploadStatus === "uploading")
              ? () => bannerInput.current.click()
              : null
          }
        ></div>
        <div className="community-info" style={{ marginLeft: 90 }}>
          <input
            ref={iconInput}
            type="file"
            accept="*.jpg, *.jpeg, *.png, *.gif"
            style={{ display: "none" }}
            data-testid="community-icon"
            onChange={(e) => {
              if (isModerator) {
                setProgressText("Uploading icon");
                setUploadStatus("uploading");
                updateCommunityIcon(
                  communityDoc.ref,
                  community?.icon,
                  e.target.files[0],
                  setProgress,
                  () => onSuccess("Icon uploded successfully"),
                  (error) => onError(error)
                );
              }
            }}
          />
          <input
            ref={bannerInput}
            type="file"
            accept="*.jpg, *.jpeg, *.png, *.gif"
            style={{ display: "none" }}
            data-testid="community-banner"
            onChange={(e) => {
              if (isModerator) {
                setProgressText("Uploading banner");
                setUploadStatus("uploading");
                updateCommunityBanner(
                  communityDoc.ref,
                  community?.banner,
                  e.target.files[0],
                  setProgress,
                  () => {
                    onSuccess("Banner updated successfully");
                  },
                  (error) => onError(error)
                );
              }
            }}
          />
          <div
            onClick={
              isModerator && !(uploadStatus === "uploading")
                ? () => iconInput.current.click()
                : null
            }
            style={{ cursor: isModerator ? "pointer" : "auto" }}
          >
            {!community?.icon ? (
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
            ) : (
              <img
                src={community.icon}
                alt={`${community.name} icon`}
                style={{ height: 50, width: 50, borderRadius: "50%" }}
              />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 data-testid="community-name" style={{ padding: 0, margin: 0 }}>
              {community?.name || (
                <ContentLoader
                  speed={2}
                  width="100%"
                  height={15}
                  viewBox="0 0 65 15"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  style={{ borderRadius: 10 }}
                >
                  <rect x="2" y="1" rx="0" ry="0" width="100%" height="100%" />
                </ContentLoader>
              )}
            </h2>
            <span
              style={{
                fontSize: 12,
                color: "#afafaf",
                fontWeight: "bolder",
              }}
              data-testid="community-handle"
            >
              {!loading && "r/"}
              {community?.name || (
                <ContentLoader
                  speed={2}
                  width={100}
                  height={15}
                  viewBox="0 0 65 15"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  style={{ borderRadius: 10 }}
                >
                  <rect x="2" y="1" rx="0" ry="0" width="70" height="8" />
                </ContentLoader>
              )}
            </span>
          </div>
          <JoinCommunityButton
            communityName={communityName}
            communityType={community?.type}
            style={{ width: 80 }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "1rem",
          marginTop: 20,
          marginLeft: 100,
          marginRight: 100,
        }}
      >
        <Posts
          data={posts}
          setData={setPosts}
          fetchPosts={(cursorDoc) =>
            getPostsByCommunity(communityName, cursorDoc)
          }
        />
        <CommunityInfo data={community} showCreatePost />
        {progress !== null && (
          <ProgressToast
            progress={progress}
            status={uploadStatus}
            text={progressText}
          />
        )}
      </div>
    </div>
  );
};

export default Community;

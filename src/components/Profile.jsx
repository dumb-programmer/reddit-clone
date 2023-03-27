import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProfileByUsername,
  getUserPosts,
  subscribeToUserDoc,
  updateUserBanner,
  updateUserProfilePicture,
} from "../firebase";
import AddPhotoIcon from "./icons/AddPhotoIcon";
import CakeIcon from "./icons/CakeIcon";
import Posts from "./Posts";
import useAuthContext from "../hooks/useAuthContext";
import "../styles/Profile.css";
import ProgressToast from "./ProgressToast";

const Profile = () => {
  const { username } = useParams();
  const [userDoc, setUserDoc] = useState(null);
  const [posts, setPosts] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressText, setProgressText] = useState("Uploading icon");
  const [uploadStatus, setUploadStatus] = useState(null);
  const auth = useAuthContext();
  const profilePictureInput = useRef();
  const bannerInput = useRef();

  const userProfile = userDoc?.data();
  const isOwner = auth && userProfile?.id === `${auth.uid}`;

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
    let unsubUser = null;
    getProfileByUsername(username).then((snap) => {
      if (!ignore) {
        setUserDoc(snap);
        unsubUser = subscribeToUserDoc(snap?.id, (snap) => setUserDoc(snap));
      }
    });

    getUserPosts(username).then((snap) => {
      if (!ignore) {
        setPosts(snap);
      }
    });

    return () => {
      ignore = true;
      unsubUser && unsubUser();
    };
  }, [username, auth?.uid]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "1rem",
        margin: "30px 100px 0 100px",
      }}
    >
      <Posts
        data={posts}
        setData={setPosts}
        fetchPosts={(cursorDoc) => getUserPosts(username, cursorDoc)}
      />
      <aside
        style={{
          backgroundColor: "#fff",
          paddingBottom: 20,
          width: 300,
          borderRadius: "0.5rem",
        }}
      >
        {isOwner && (
          <>
            <input
              data-testid="profile-picture-input"
              type="file"
              style={{ display: "none" }}
              ref={profilePictureInput}
              accept="*.jpeg,*.jpg,*.gif,*.png,*.webp"
              onChange={async (e) => {
                setProgressText("Uploading profile picture");
                setUploadStatus("uploading");
                updateUserProfilePicture(
                  userDoc.ref,
                  userProfile?.profilePicture,
                  setProgress,
                  e.target.files[0],
                  () => onSuccess("Profile picture uploded successfully"),
                  (error) => onError(error)
                );
              }}
            />
            <input
              data-testid="banner-input"
              type="file"
              style={{ display: "none" }}
              ref={bannerInput}
              accept="*.jpeg,*.jpg,*.gif,*.png,*.webp"
              onChange={async (e) => {
                setProgressText("Uploading banner");
                setUploadStatus("uploading");
                updateUserBanner(
                  userDoc.ref,
                  userProfile?.banner,
                  setProgress,
                  e.target.files[0],
                  () => onSuccess("Banner uploded successfully"),
                  (error) => onError(error)
                );
              }}
            />
          </>
        )}
        <div
          data-testid="user-banner"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#33a8ff",
            backgroundImage:
              userProfile?.banner !== null && `url(${userProfile?.banner})`,
            backgroundSize: "cover",
            backgroundPosition: "50%",
            height: 40,
            width: "100%",
            borderRadius: "4px 4px 0 0",
          }}
        >
          {isOwner && (
            <button
              data-testid="add-banner-btn"
              className="add-banner-btn"
              onClick={() => bannerInput.current.click()}
            >
              <AddPhotoIcon height={30} width={30} stroke="#0079d3" />
            </button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 15,
          }}
        >
          <img
            data-testid="profile-picture"
            src={userProfile?.profilePicture}
            alt="profile"
            height={100}
            width={100}
            onClick={isOwner ? () => profilePictureInput.current.click() : null}
            style={isOwner ? { cursor: "pointer" } : null}
          />
          <h3>{userProfile?.displayName || userProfile?.username}</h3>
          <span
            style={{
              color: "#7c7c7c",
              fontWeight: "bolder",
              fontSize: 12,
              marginTop: -15,
            }}
          >
            u/{userProfile?.username}{" "}
          </span>
          {userProfile?.about && (
            <p style={{ margin: "10px 10px", textAlign: "center" }}>
              {userProfile?.about}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            paddingLeft: 50,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}>
            Cake day :
          </p>
          <p style={{ marign: 0 }}>
            <CakeIcon height={18} width={18} color="#24a0ed" />
          </p>
          <span
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: "bold",
              color: "#afafaf",
            }}
          >
            {Intl.DateTimeFormat("en-us", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(userProfile?.joined_on?.toMillis())}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button className="primary-btn" style={{ width: "80%" }}>
            New Post
          </button>
        </div>
      </aside>
      {progress !== null && (
        <ProgressToast
          progress={progress}
          status={uploadStatus}
          text={progressText}
        />
      )}
    </div>
  );
};

export default Profile;

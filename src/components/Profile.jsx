import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  changeProfilePicture,
  getProfileByUsername,
  getUserPosts,
  subscribeToUserDoc,
  uploadUserBanner,
} from "../firebase";
import AddPhotoIcon from "./icons/AddPhotoIcon";
import CakeIcon from "./icons/CakeIcon";
import Posts from "./Posts";
import "../styles/Profile.css";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState(null);
  const auth = useContext(AuthContext);
  const { username } = useParams();
  const profilePictureInput = useRef();
  const bannerInput = useRef();

  const isOwner = auth && userProfile?.id === `${auth.uid}`;

  useEffect(() => {
    let ignore = false;
    let unsubUser = null;
    getProfileByUsername(username).then((snap) => {
      if (!ignore) {
        setUserProfile(snap);
        unsubUser = subscribeToUserDoc(snap.id, (snap) =>
          setUserProfile(snap.data())
        );
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
        margin: "90px 100px 0 100px",
      }}
    >
      <Posts data={posts} />
      <aside
        style={{
          backgroundColor: "#fff",
          paddingBottom: 20,
          minWidth: 300,
          borderRadius: "0.5rem",
        }}
      >
        {isOwner && (
          <>
            <input
              type="file"
              style={{ display: "none" }}
              ref={profilePictureInput}
              accept="*.jpeg,*.jpg,*.gif,*.png,*.webp"
              onChange={async (e) => {
                await changeProfilePicture(auth.uid, e.target.files[0]);
              }}
            />
            <input
              type="file"
              style={{ display: "none" }}
              ref={bannerInput}
              accept="*.jpeg,*.jpg,*.gif,*.png,*.webp"
              onChange={async (e) => {
                await uploadUserBanner(auth.uid, e.target.files[0]);
              }}
            />
          </>
        )}
        <div
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
            src={userProfile?.profilePicture}
            alt="profile"
            height={100}
            width={100}
            onClick={isOwner ? () => profilePictureInput.current.click() : null}
            style={isOwner ? { cursor: "pointer" } : null}
          />
          <h3>{userProfile?.username}</h3>
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
    </div>
  );
};

export default Profile;
